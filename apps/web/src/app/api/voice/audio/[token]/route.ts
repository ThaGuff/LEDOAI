import { NextRequest, NextResponse } from 'next/server'
import { getCachedAudio } from '@/lib/tts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/voice/audio/[token] -> raw audio bytes for Twilio <Play>.
// No auth: Twilio can't sign in. The token is a non-guessable sha256 hash.
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const entry = getCachedAudio(params.token)
  if (!entry) {
    return new NextResponse('Audio expired or not found', { status: 404 })
  }
  return new NextResponse(entry.audio, {
    status: 200,
    headers: {
      'Content-Type': entry.contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
