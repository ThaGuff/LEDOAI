import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { synthesizeSpeech, parseVoice, audioToken, cacheAudio } from '@/lib/tts'
import twilio from 'twilio'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Normalize a phone number to E.164. Accepts (303) 555-1234, 303-555-1234, etc.
// Defaults to US (+1) when no country code is present.
function toE164(input: string): string | null {
  const digits = (input || '').replace(/[^\d+]/g, '')
  if (!digits) return null
  if (digits.startsWith('+')) {
    return /^\+\d{8,15}$/.test(digits) ? digits : null
  }
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

function publicBaseUrl(req: NextRequest): string {
  // Prefer explicit env, then Railway, then host header.
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_PUBLIC_URL
  if (env) return env.replace(/\/$/, '')
  const host = req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  return host ? `${proto}://${host}` : ''
}

// Sign the TwiML token so only Twilio (with our secret) can fetch a valid script.
function signToken(payload: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'ledo-fallback-secret'
  return crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 24)
}

// POST { phone } -> initiates an outbound test call to the user's phone
// playing the configured greeting in the configured voice.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const phoneRaw = typeof body?.phone === 'string' ? body.phone : ''
  const phone = toE164(phoneRaw)
  if (!phone) {
    return NextResponse.json(
      { error: 'Please enter a valid phone number (e.g. 303-555-1234 or +13035551234).' },
      { status: 400 },
    )
  }

  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    return NextResponse.json(
      {
        error:
          'Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable test calls.',
      },
      { status: 503 },
    )
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  if (!org.twilioPhoneNumber) {
    return NextResponse.json(
      {
        error:
          'No Twilio phone number is connected. Add one in Settings → Phone Setup before running a test call.',
      },
      { status: 400 },
    )
  }

  const greeting =
    org.greeting?.trim() ||
    `Hi! This is ${org.aiAgentName || 'LEDO'} from ${org.name}. This is a test of your AI receptionist. Hang up whenever you're ready.`
  const voice = org.aiVoice || 'polly:Polly.Joanna-Neural'
  const { provider } = parseVoice(voice)

  const base = publicBaseUrl(req)
  if (!base) {
    return NextResponse.json({ error: 'Could not determine public app URL.' }, { status: 500 })
  }

  // For premium voices we synthesize once and cache so Twilio can <Play> it.
  let twimlUrl: string
  if (provider === 'polly') {
    // Build a TwiML URL that uses <Say voice=Polly.X>
    const tok = audioToken(greeting, voice)
    const sig = signToken(`polly:${tok}`)
    twimlUrl = `${base}/api/voice/twiml/test?mode=polly&voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(greeting)}&tok=${tok}&sig=${sig}`
  } else {
    const synth = await synthesizeSpeech(greeting, voice)
    if ('error' in synth) {
      return NextResponse.json({ error: synth.error }, { status: synth.status })
    }
    const tok = audioToken(greeting, voice)
    cacheAudio(tok, synth.audio, synth.contentType)
    const sig = signToken(`play:${tok}`)
    twimlUrl = `${base}/api/voice/twiml/test?mode=play&tok=${tok}&sig=${sig}`
  }

  try {
    const client = twilio(sid, token)
    const call = await client.calls.create({
      to: phone,
      from: org.twilioPhoneNumber,
      url: twimlUrl,
      method: 'GET',
      timeout: 30,
    })

    // Audit log (best-effort).
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: orgId,
          userId: session?.user?.id || null,
          action: 'voice.test_call',
          entityType: 'Call',
          entityId: call.sid,
          metadata: { to: phone, voice } as object,
        },
      })
    } catch {}

    return NextResponse.json({
      ok: true,
      callSid: call.sid,
      message: `Calling ${phone}. It may take 5-10 seconds to ring.`,
    })
  } catch (e: any) {
    console.error('Twilio test call failed:', e)
    const msg =
      e?.message?.includes('not a valid phone number') || e?.code === 21211
        ? 'Twilio rejected the phone number. Double-check the format.'
        : e?.message?.includes('not enabled for calls') || e?.code === 21215
          ? 'Your Twilio account is not permitted to call this region. Enable geo permissions in Twilio.'
          : `Twilio error: ${e?.message || 'Unknown'}`
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
