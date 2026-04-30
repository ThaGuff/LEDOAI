import { prisma } from '@/lib/prisma'

export default async function AdminOrganizationsPage() {
  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { users: true, callLogs: true, appointments: true } },
    },
    take: 200,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Organizations</h1>
        <p className="text-sm text-gray-500 mt-0.5">{orgs.length} organizations total</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Organization</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-right">Users</th>
                <th className="px-4 py-3 text-right">Calls</th>
                <th className="px-4 py-3 text-right">Appointments</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgs.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.name}</p>
                    <p className="text-xs text-gray-500">{o.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-ledo-50 text-ledo-700 capitalize">
                      {o.planId}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">{o.twilioPhoneNumber || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{o._count.users}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{o._count.callLogs}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{o._count.appointments}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No organizations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
