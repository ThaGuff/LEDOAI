import { prisma } from '@/lib/prisma'
import { Users, Building2, Phone, Calendar } from 'lucide-react'

export default async function AdminOverview() {
  const [userCount, orgCount, callCount, apptCount, recentSignups] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.callLog.count(),
    prisma.appointment.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { organization: true },
    }),
  ])

  const stats = [
    { label: 'Total users', value: userCount, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Organizations', value: orgCount, icon: Building2, color: 'bg-purple-50 text-purple-600' },
    { label: 'Calls handled', value: callCount, icon: Phone, color: 'bg-green-50 text-green-600' },
    { label: 'Appointments', value: apptCount, icon: Calendar, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide metrics and recent activity</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-display font-bold text-gray-900 mt-3">{s.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <p className="font-semibold text-gray-900">Recent signups</p>
        </div>
        <div className="divide-y divide-gray-100">
          {recentSignups.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No signups yet.</p>
          ) : (
            recentSignups.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.name || u.email}</p>
                  <p className="text-xs text-gray-500">
                    {u.organization?.name || 'No org'} · {u.email}
                  </p>
                </div>
                <p className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
