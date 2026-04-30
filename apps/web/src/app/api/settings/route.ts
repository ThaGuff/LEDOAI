import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const allowed: Record<string, true> = {
      twilioPhoneNumber: true,
      transferNumber: true,
      aiPersonality: true,
      greeting: true,
      businessHours: true,
      name: true,
    }
    const data: Record<string, unknown> = {}
    for (const k of Object.keys(body)) if (allowed[k]) data[k] = body[k]

    const org = await prisma.organization.update({
      where: { id: orgId },
      data,
    })
    return NextResponse.json({ ok: true, organization: org })
  } catch (e) {
    console.error('Settings update error:', e)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
