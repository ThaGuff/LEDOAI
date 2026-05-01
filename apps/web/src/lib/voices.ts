// Voice catalog — safe to import from both server and client components.
// Voices are encoded as `provider:voiceId` strings.

export type VoiceProvider = 'openai' | 'elevenlabs' | 'streamelements' | 'polly'

export type VoiceOption = {
  id: string // full provider:voiceId
  provider: VoiceProvider
  voiceId: string
  label: string
  description: string
  language?: string
  premium?: boolean
}

export const VOICE_CATALOG: VoiceOption[] = [
  // OpenAI — best quality:cost ratio, natural on the phone.
  { id: 'openai:nova', provider: 'openai', voiceId: 'nova', label: 'Nova', description: 'Warm female · Most natural', premium: true },
  { id: 'openai:shimmer', provider: 'openai', voiceId: 'shimmer', label: 'Shimmer', description: 'Soft female · Calm', premium: true },
  { id: 'openai:alloy', provider: 'openai', voiceId: 'alloy', label: 'Alloy', description: 'Neutral · Versatile', premium: true },
  { id: 'openai:echo', provider: 'openai', voiceId: 'echo', label: 'Echo', description: 'Male · Friendly', premium: true },
  { id: 'openai:fable', provider: 'openai', voiceId: 'fable', label: 'Fable', description: 'British male · Storyteller', premium: true },
  { id: 'openai:onyx', provider: 'openai', voiceId: 'onyx', label: 'Onyx', description: 'Deep male · Authoritative', premium: true },

  // ElevenLabs — top-shelf voice clones. Voice IDs below are public defaults.
  { id: 'elevenlabs:21m00Tcm4TlvDq8ikWAM', provider: 'elevenlabs', voiceId: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (ElevenLabs)', description: 'Most realistic female', premium: true },
  { id: 'elevenlabs:29vD33N1CtxCmqQRPOHJ', provider: 'elevenlabs', voiceId: '29vD33N1CtxCmqQRPOHJ', label: 'Drew (ElevenLabs)', description: 'Calm male · Premium', premium: true },
  { id: 'elevenlabs:AZnzlk1XvdvUeBnXmlld', provider: 'elevenlabs', voiceId: 'AZnzlk1XvdvUeBnXmlld', label: 'Domi (ElevenLabs)', description: 'Strong female · Premium', premium: true },
  { id: 'elevenlabs:EXAVITQu4vr4xnSDxMaL', provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella (ElevenLabs)', description: 'Soft female · Premium', premium: true },

  // StreamElements — free unlimited (fair use), Polly/Microsoft voices over HTTP.
  { id: 'streamelements:Brian', provider: 'streamelements', voiceId: 'Brian', label: 'Brian (Free)', description: 'British male · Free unlimited' },
  { id: 'streamelements:Amy', provider: 'streamelements', voiceId: 'Amy', label: 'Amy (Free)', description: 'British female · Free unlimited' },
  { id: 'streamelements:Joanna', provider: 'streamelements', voiceId: 'Joanna', label: 'Joanna (Free)', description: 'US female · Free unlimited' },
  { id: 'streamelements:Matthew', provider: 'streamelements', voiceId: 'Matthew', label: 'Matthew (Free)', description: 'US male · Free unlimited' },

  // Polly via Twilio — no extra cost, only available on actual phone calls.
  { id: 'polly:Polly.Joanna-Neural', provider: 'polly', voiceId: 'Polly.Joanna-Neural', label: 'Joanna (Polly Neural)', description: 'US female · Twilio standard' },
  { id: 'polly:Polly.Matthew-Neural', provider: 'polly', voiceId: 'Polly.Matthew-Neural', label: 'Matthew (Polly Neural)', description: 'US male · Twilio standard' },
  { id: 'polly:Polly.Amy-Neural', provider: 'polly', voiceId: 'Polly.Amy-Neural', label: 'Amy (Polly Neural)', description: 'UK female · Twilio standard' },
]

export function parseVoice(voice: string | undefined | null): { provider: VoiceProvider; voiceId: string } {
  if (!voice) return { provider: 'polly', voiceId: 'Polly.Joanna-Neural' }
  if (voice.includes(':')) {
    const [p, ...rest] = voice.split(':')
    return { provider: p as VoiceProvider, voiceId: rest.join(':') }
  }
  if (voice.startsWith('Polly.')) return { provider: 'polly', voiceId: voice }
  return { provider: 'polly', voiceId: voice }
}

// Group voices by provider for grouped <select> rendering.
export const VOICE_GROUPS: { provider: VoiceProvider; label: string; voices: VoiceOption[] }[] = [
  { provider: 'openai', label: 'OpenAI Neural — Recommended', voices: VOICE_CATALOG.filter((v) => v.provider === 'openai') },
  { provider: 'elevenlabs', label: 'ElevenLabs — Premium clones', voices: VOICE_CATALOG.filter((v) => v.provider === 'elevenlabs') },
  { provider: 'streamelements', label: 'Free — StreamElements', voices: VOICE_CATALOG.filter((v) => v.provider === 'streamelements') },
  { provider: 'polly', label: 'AWS Polly — via Twilio', voices: VOICE_CATALOG.filter((v) => v.provider === 'polly') },
]
