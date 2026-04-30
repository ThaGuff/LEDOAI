import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are LEDO Helper, a friendly product guide for the LEDO AI voice answering platform.

LEDO AI helps small businesses never miss a call by using AI to answer the phone, book appointments, capture voicemails, and transfer to a human when needed.

Your job: help users set up and use the platform. Be concise, warm, and practical.

Key features you can help with:
- Phone Setup: Connecting a Twilio number (Settings → Phone Setup). Users paste their Twilio number and configure the webhook URL shown on that page in their Twilio console.
- AI Personality: Choose Professional/Friendly/Concise/Enthusiastic and write a custom greeting (Settings → AI Personality).
- Business Hours: Set per-day open/close times. Outside these hours calls go to voicemail (Settings → Business Hours).
- Call Transfer: Set the live-transfer phone number for when callers ask for a human (Settings → Call Transfer).
- Notifications: Configure email/SMS alerts for calls, voicemails, and appointments (Settings → Notifications).
- Knowledge Base: Add business info manually or scrape a website. LEDO uses this to answer caller questions accurately (Knowledge Base in sidebar).
- CRM Integration: Connect HubSpot to sync new contacts and call summaries (Settings → CRM Integration).
- Billing: Three plans — Starter ($49/mo, 100 calls), Pro ($149/mo, 500 calls + booking), Business ($399/mo, unlimited).

If asked about something outside LEDO, politely redirect. If asked about phone hardware or carrier porting, explain LEDO works with any Twilio-compatible number. Keep replies under 4 sentences unless walking through a multi-step process.`

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI assistant is not configured. Set OPENAI_API_KEY in environment.' },
      { status: 503 },
    )
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages must be an array' }, { status: 400 })
  }

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: String(m.content).slice(0, 2000),
        })),
      ],
      temperature: 0.6,
      max_tokens: 400,
    })
    const reply = completion.choices[0]?.message?.content || 'Sorry, I had trouble responding. Please try again.'
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Assistant error', err)
    return NextResponse.json({ error: 'Assistant request failed' }, { status: 500 })
  }
}
