import { NextRequest, NextResponse } from 'next/server'
import { parseVoice } from '@/lib/tts'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function signToken(payload: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'ledo-fallback-secret'
  return crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 24)
}

function publicBaseUrl(req: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_PUBLIC_URL
  if (env) return env.replace(/\/$/, '')
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  return host ? `${proto}://${host}` : ''
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;',
  )
}

function xml(body: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>${body}`, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

// GET /api/voice/twiml/test?mode=play|polly&...&sig=
// Returns TwiML that Twilio fetches to render the test call.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') || 'play'
  const tok = searchParams.get('tok') || ''
  const sig = searchParams.get('sig') || ''

  const expected =
    mode === 'polly' ? signToken(`polly:${tok}`) : signToken(`play:${tok}`)
  if (!sig || sig !== expected) {
    return xml('<Response><Say>Invalid request.</Say><Hangup/></Response>')
  }

  if (mode === 'polly') {
    const voice = searchParams.get('voice') || 'polly:Polly.Joanna-Neural'
    const text = searchParams.get('text') || 'This is a test call from LEDO AI.'
    const { voiceId } = parseVoice(voice)
    const body = `<Response><Say voice="${escapeXml(voiceId)}">${escapeXml(text)}</Say><Pause length="1"/><Say voice="${escapeXml(voiceId)}">Goodbye.</Say><Hangup/></Response>`
    return xml(body)
  }

  // Premium / synthesized audio path.
  const base = publicBaseUrl(req)
  const audioUrl = `${base}/api/voice/audio/${encodeURIComponent(tok)}`
  const body = `<Response><Play>${escapeXml(audioUrl)}</Play><Pause length="1"/><Hangup/></Response>`
  return xml(body)
}
