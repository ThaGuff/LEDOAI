import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const appointments = await prisma.appointment.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { scheduledAt: 'asc' },
    include: { callLog: { select: { from: true, callSid: true } } },
  })
  return NextResponse.json({ appointments })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, status } = await req.json()
  const appointment = await prisma.appointment.updateMany({
    where: { id, organizationId: session.user.organizationId },
    data: { status },
  })
  return NextResponse.json({ appointment })
}
