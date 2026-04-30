import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationsForm } from '@/components/settings/NotificationsForm'

export default async function NotificationsSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const settings = orgId
    ? await prisma.notificationSettings.findUnique({ where: { organizationId: orgId } })
    : null

  return (
    <NotificationsForm
      initial={{
        emailEnabled: settings?.emailEnabled ?? true,
        smsEnabled: settings?.smsEnabled ?? false,
        notifyOnCall: settings?.notifyOnCall ?? true,
        notifyOnVoicemail: settings?.notifyOnVoicemail ?? true,
        notifyOnAppointment: settings?.notifyOnAppointment ?? true,
        recipientEmails: (settings?.recipientEmails as string[] | null) || [],
        recipientPhones: (settings?.recipientPhones as string[] | null) || [],
      }}
    />
  )
}
