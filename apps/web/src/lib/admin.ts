import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user?.isSuperAdmin) return null
  return user
}
