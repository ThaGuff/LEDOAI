import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'
import { AssistantWidget } from '@/components/assistant/AssistantWidget'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')

  const dbUser = session.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { isSuperAdmin: true } })
    : null

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isSuperAdmin={dbUser?.isSuperAdmin || false} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <AssistantWidget />
    </div>
  )
}
