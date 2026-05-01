// Voice synthesis abstraction. Voices are encoded as `provider:voiceId` strings
// so the rest of the app can stay provider-agnostic.
//
// Supported providers:
//   openai          — high-quality neural voices, ~$0.015 per 1k chars (recommended)
//   elevenlabs      — premium voice clones, free tier ~10k chars/mo
//   streamelements  — free, no key required, uses Polly/Microsoft voices via the
//                     public StreamElements TTS endpoint (fair use)
//   polly           — handled by Twilio's <Say voice="Polly..."> directly,
//                     never returns audio bytes from this module

import crypto from 'crypto'
import { parseVoice as parseVoiceShared } from './voices'

export { VOICE_CATALOG, VOICE_GROUPS, parseVoice } from './voices'
export type { VoiceProvider, VoiceOption } from './voices'

// Stable hash so the same (text, voice) pair always maps to the same audio token.
export function audioToken(text: string, voice: string): string {
  return crypto.createHash('sha256').update(`${voice}::${text}`).digest('hex').slice(0, 32)
}

export type SynthResult = { audio: Buffer; contentType: string } | { error: string; status: number }

export async function synthesizeSpeech(text: string, voice: string): Promise<SynthResult> {
  const cleaned = text.trim().slice(0, 1500)
  if (!cleaned) return { error: 'Text is empty', status: 400 }

  const { provider, voiceId } = parseVoiceShared(voice)

  switch (provider) {
    case 'openai':
      return synthesizeOpenAI(cleaned, voiceId)
    case 'elevenlabs':
      return synthesizeElevenLabs(cleaned, voiceId)
    case 'streamelements':
      return synthesizeStreamElements(cleaned, voiceId)
    case 'polly':
      return {
        error:
          'Polly voices play directly through Twilio during a real call and cannot be previewed in the browser. Try a different voice for preview, or use the "Call my phone" test.',
        status: 422,
      }
    default:
      return { error: `Unknown voice provider: ${provider}`, status: 400 }
  }
}

async function synthesizeOpenAI(text: string, voiceId: string): Promise<SynthResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { error: 'OpenAI is not configured. Set OPENAI_API_KEY.', status: 503 }

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1', // tts-1-hd for higher quality at higher cost
      voice: voiceId,
      input: text,
      response_format: 'mp3',
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    return { error: `OpenAI TTS failed (${res.status}): ${errText.slice(0, 200)}`, status: 502 }
  }

  const buf = Buffer.from(await res.arrayBuffer())
  return { audio: buf, contentType: 'audio/mpeg' }
}

async function synthesizeElevenLabs(text: string, voiceId: string): Promise<SynthResult> {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) {
    return {
      error:
        'ElevenLabs is not configured. Add ELEVENLABS_API_KEY to your environment to enable premium voices (free tier available at elevenlabs.io).',
      status: 503,
    }
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=2`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    return { error: `ElevenLabs TTS failed (${res.status}): ${errText.slice(0, 200)}`, status: 502 }
  }

  const buf = Buffer.from(await res.arrayBuffer())
  return { audio: buf, contentType: 'audio/mpeg' }
}

// StreamElements is a public TTS endpoint widely used by Twitch streamers.
// No API key required — counts as "free unlimited" for low-volume use.
async function synthesizeStreamElements(text: string, voiceId: string): Promise<SynthResult> {
  const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(text)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) {
    return { error: `Free TTS service returned ${res.status}. Try another voice.`, status: 502 }
  }
  const buf = Buffer.from(await res.arrayBuffer())
  return { audio: buf, contentType: 'audio/mpeg' }
}

// In-process audio cache for the Twilio <Play> flow. The web app generates
// audio once and caches it for 1 hour; Twilio fetches it via the audio route.
// For multi-instance prod swap for Redis or upload to S3.
type CacheEntry = { audio: Buffer; contentType: string; expires: number }
const audioCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000

export function cacheAudio(token: string, audio: Buffer, contentType: string) {
  audioCache.set(token, { audio, contentType, expires: Date.now() + CACHE_TTL_MS })
  // Lazy GC.
  if (audioCache.size > 500) {
    const now = Date.now()
    for (const [k, v] of audioCache.entries()) {
      if (v.expires < now) audioCache.delete(k)
    }
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
