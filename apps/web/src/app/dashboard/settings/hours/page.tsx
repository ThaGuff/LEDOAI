import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { HoursForm } from '@/components/settings/HoursForm'

export default async function HoursSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null
  const hours = (org?.businessHours as Record<string, { open: string; close: string; enabled: boolean }> | null) || null

  return <HoursForm initial={hours} />
}
