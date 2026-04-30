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
    const data = {
      emailEnabled: !!body.emailEnabled,
      smsEnabled: !!body.smsEnabled,
      notifyOnCall: !!body.notifyOnCall,
      notifyOnVoicemail: !!body.notifyOnVoicemail,
      notifyOnAppointment: !!body.notifyOnAppointment,
      recipientEmails: Array.isArray(body.recipientEmails) ? body.recipientEmails : [],
      recipientPhones: Array.isArray(body.recipientPhones) ? body.recipientPhones : [],
    }
    const updated = await prisma.notificationSettings.upsert({
      where: { organizationId: orgId },
      update: data,
      create: { ...data, organizationId: orgId },
    })
    return NextResponse.json({ ok: true, settings: updated })
  } catch (e) {
    console.error('Notification settings update error:', e)
    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 })
  }
}
