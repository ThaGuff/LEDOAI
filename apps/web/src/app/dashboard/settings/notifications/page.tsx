import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NotificationsForm } from '@/components/settings/NotificationsForm'

// Older rows may have stored recipientEmails / recipientPhones as JSON strings
// (e.g. '["foo@bar.com"]') instead of native JSON arrays. Normalize defensively
// so the React form never receives a non-array value (which would crash .map()).
function toStringArray(input: unknown): string[] {
  if (input == null) return []
  if (Array.isArray(input)) return input.filter((v): v is string => typeof v === 'string')
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === 'string')
      }
    } catch {
      // Not JSON — treat as a single value (or comma separated list)
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

export default async function NotificationsSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  let settings = orgId
    ? await prisma.notificationSettings.findUnique({ where: { organizationId: orgId } })
    : null

  // Self-healing: if either recipient field was stored as a JSON string by an older
  // signup route, normalize it to a real array and write it back so this only
  // happens once per row.
  if (orgId && settings) {
    const cleanEmails = toStringArray(settings.recipientEmails)
    const cleanPhones = toStringArray(settings.recipientPhones)
    const emailsBad = !Array.isArray(settings.recipientEmails)
    const phonesBad = !Array.isArray(settings.recipientPhones)
    if (emailsBad || phonesBad) {
      try {
        settings = await prisma.notificationSettings.update({
          where: { organizationId: orgId },
          data: { recipientEmails: cleanEmails, recipientPhones: cleanPhones },
        })
      } catch (e) {
        console.error('Notification settings auto-repair failed:', e)
      }
    }
  }

  return (
    <NotificationsForm
      initial={{
        emailEnabled: settings?.emailEnabled ?? true,
        smsEnabled: settings?.smsEnabled ?? false,
        notifyOnCall: settings?.notifyOnCall ?? true,
        notifyOnVoicemail: settings?.notifyOnVoicemail ?? true,
        notifyOnAppointment: settings?.notifyOnAppointment ?? true,
        recipientEmails: toStringArray(settings?.recipientEmails),
        recipientPhones: toStringArray(settings?.recipientPhones),
      }}
    />
  )
}
