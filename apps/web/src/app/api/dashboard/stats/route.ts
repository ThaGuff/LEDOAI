import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orgId = session.user.organizationId
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalCalls, callsThisMonth, appointmentsBooked, voicemails, transfers, recentCalls] = await Promise.all([
    prisma.callLog.count({ where: { organizationId: orgId } }),
    prisma.callLog.count({ where: { organizationId: orgId, createdAt: { gte: startOfMonth } } }),
    prisma.callLog.count({ where: { organizationId: orgId, appointmentBooked: true } }),
    prisma.callLog.count({ where: { organizationId: orgId, voicemailLeft: true } }),
    prisma.callLog.count({ where: { organizationId: orgId, transferred: true } }),
    prisma.callLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return NextResponse.json({
    totalCalls,
    callsThisMonth,
    appointmentsBooked,
    voicemails,
    transfers,
    recentCalls,
  })
}
