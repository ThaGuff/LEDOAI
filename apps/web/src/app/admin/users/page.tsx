import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { organization: { select: { name: true, slug: true } } },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} users total</p>
      </div>
      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isSuperAdmin: u.isSuperAdmin,
          organizationName: u.organization?.name || null,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
