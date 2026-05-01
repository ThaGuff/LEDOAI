'use client'

import { useRef, useState } from 'react'
import { Play, Pause, Phone, Loader2, Sparkles } from 'lucide-react'

type Props = {
  voice: string
  text: string
  // Optional default phone (e.g. user's own phone) for test call.
  defaultPhone?: string
}

export function VoiceTester({ voice, text, defaultPhone }: Props) {
  const [busy, setBusy] = useState<'preview' | 'call' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [phone, setPhone] = useState(defaultPhone || '')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  function clearMessages() {
    setError(null)
    setInfo(null)
  }

  async function preview() {
    clearMessages()
    if (!text.trim()) {
      setError('Add a greeting or text to preview.')
      return
    }
    if (busy) return
    setBusy('preview')
    try {
      const res = await fetch('/api/voice/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || `Preview failed (${res.status}).`)
        return
      }
      const blob = await res.blob()
      // Revoke any previous blob URL.
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = URL.createObjectURL(blob)
      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = blobUrlRef.current
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onpause = () => setPlaying(false)
      audioRef.current.onplay = () => setPlaying(true)
      await audioRef.current.play()
    } catch (e: any) {
      setError(e?.message || 'Could not play preview.')
    } finally {
      setBusy(null)
    }
  }

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaying(false)
  }

  async function callMe() {
    clearMessages()
    if (!phone.trim()) {
      setError('Enter the phone number to call.')
      return
    }
    if (busy) return
    setBusy('call')
    try {
      const res = await fetch('/api/voice/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(j.error || `Test call failed (${res.status}).`)
        return
      }
      setInfo(j.message || 'Calling now...')
    } catch (e: any) {
      setError(e?.message || 'Could not start the test call.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="rounded-xl border border-ledo-100 bg-ledo-50/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-ledo-600" />
        <p className="text-sm font-semibold text-gray-900">Preview your AI voice</p>
      </div>
      <p className="text-xs text-gray-600">
        Test the selected voice with your current greeting. Browser preview uses our TTS API. Test
        call rings your phone using your connected Twilio number.
      </p>

      <div className="flex flex-wrap gap-2">
        {!playing ? (
          <button
            type="button"
            onClick={preview}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-ledo-200 text-ledo-700 text-sm font-medium rounded-lg hover:bg-ledo-50 disabled:opacity-50"
          >
            {busy === 'preview' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {busy === 'preview' ? 'Synthesizing...' : 'Preview in browser'}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-ledo-200 text-ledo-700 text-sm font-medium rounded-lg hover:bg-ledo-50"
          >
            <Pause className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 303 555 1234"
          className="flex-1 px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ledo-500"
        />
        <button
          type="button"
          onClick={callMe}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-ledo-600 text-white text-sm font-semibold rounded-lg hover:bg-ledo-700 disabled:opacity-50"
        >
          {busy === 'call' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
          {busy === 'call' ? 'Dialing...' : 'Call my phone'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {info && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {info}
        </p>
      )}
    </div>
  )
}
