import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { synthesizeSpeech } from '@/lib/tts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST { text, voice } -> audio/mpeg bytes for in-browser <audio> playback.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const text = typeof body?.text === 'string' ? body.text : ''
  const voice = typeof body?.voice === 'string' ? body.voice : ''
  if (!text.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 })
  if (!voice) return NextResponse.json({ error: 'Voice required' }, { status: 400 })

  const result = await synthesizeSpeech(text, voice)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return new NextResponse(result.audio, {
    status: 200,
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'private, max-age=300',
    },
  })
}
