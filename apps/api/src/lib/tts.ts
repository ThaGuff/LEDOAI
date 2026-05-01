// Mirror of apps/web/src/lib/tts.ts — keeps the API service self-contained
// for inbound calls. Provider-agnostic TTS with in-memory cache so Twilio
// can fetch synthesized audio via /twilio/audio/[token].
import crypto from 'crypto'

export type VoiceProvider = 'openai' | 'elevenlabs' | 'streamelements' | 'polly'

export function parseVoice(voice: string | undefined | null): { provider: VoiceProvider; voiceId: string } {
  if (!voice) return { provider: 'polly', voiceId: 'Polly.Joanna-Neural' }
  if (voice.includes(':')) {
    const [p, ...rest] = voice.split(':')
    return { provider: p as VoiceProvider, voiceId: rest.join(':') }
  }
  if (voice.startsWith('Polly.')) return { provider: 'polly', voiceId: voice }
  return { provider: 'polly', voiceId: voice }
}

export function audioToken(text: string, voice: string): string {
  return crypto.createHash('sha256').update(`${voice}::${text}`).digest('hex').slice(0, 32)
}

export type SynthResult = { audio: Buffer; contentType: string } | { error: string; status: number }

export async function synthesizeSpeech(text: string, voice: string): Promise<SynthResult> {
  const cleaned = text.trim().slice(0, 1500)
  if (!cleaned) return { error: 'Text is empty', status: 400 }

  const { provider, voiceId } = parseVoice(voice)

  switch (provider) {
    case 'openai':
      return synthesizeOpenAI(cleaned, voiceId)
    case 'elevenlabs':
      return synthesizeElevenLabs(cleaned, voiceId)
    case 'streamelements':
      return synthesizeStreamElements(cleaned, voiceId)
    case 'polly':
      return { error: 'Polly is rendered inline by Twilio.', status: 422 }
    default:
      return { error: `Unknown voice provider: ${provider}`, status: 400 }
  }
}

async function synthesizeOpenAI(text: string, voiceId: string): Promise<SynthResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { error: 'OPENAI_API_KEY not set', status: 503 }
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', voice: voiceId, input: text, response_format: 'mp3' }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    return { error: `OpenAI TTS ${res.status}: ${err.slice(0, 200)}`, status: 502 }
  }
  return { audio: Buffer.from(await res.arrayBuffer()), contentType: 'audio/mpeg' }
}

async function synthesizeElevenLabs(text: string, voiceId: string): Promise<SynthResult> {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) return { error: 'ELEVENLABS_API_KEY not set', status: 503 }
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
      }),
    },
  )
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    return { error: `ElevenLabs ${res.status}: ${err.slice(0, 200)}`, status: 502 }
  }
  return { audio: Buffer.from(await res.arrayBuffer()), contentType: 'audio/mpeg' }
}

async function synthesizeStreamElements(text: string, voiceId: string): Promise<SynthResult> {
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(text)}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return { error: `StreamElements ${res.status}`, status: 502 }
    return { audio: Buffer.from(await res.arrayBuffer()), contentType: 'audio/mpeg' }
  } finally {
    clearTimeout(timer)
  }
}

// In-process cache for Twilio <Play>. Use Redis/S3 for multi-instance prod.
type CacheEntry = { audio: Buffer; contentType: string; expires: number }
const audioCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000

export function cacheAudio(token: string, audio: Buffer, contentType: string) {
  audioCache.set(token, { audio, contentType, expires: Date.now() + CACHE_TTL_MS })
  if (audioCache.size > 500) {
    const now = Date.now()
    for (const [k, v] of audioCache.entries()) if (v.expires < now) audioCache.delete(k)
  }
}

export function getCachedAudio(token: string): { audio: Buffer; contentType: string } | null {
  const entry = audioCache.get(token)
  if (!entry || entry.expires < Date.now()) {
    if (entry) audioCache.delete(token)
    return null
  }
  return { audio: entry.audio, contentType: entry.contentType }
}

// Helper: synthesize, cache, return public Twilio audio URL.
// Falls back to null if not synthesizable (caller should use <Say> instead).
export async function buildPlayUrl(
  text: string,
  voice: string,
  publicBase: string,
): Promise<string | null> {
  const { provider } = parseVoice(voice)
  if (provider === 'polly') return null
  const result = await synthesizeSpeech(text, voice)
  if ('error' in result) {
    console.warn(`TTS failed for ${provider}: ${result.error}`)
    return null
  }
  const tok = audioToken(text, voice)
  cacheAudio(tok, result.audio, result.contentType)
  return `${publicBase.replace(/\/$/, '')}/twilio/audio/${tok}`
}
