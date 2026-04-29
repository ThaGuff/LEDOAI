import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Phone, Calendar, Mic, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatPhone, formatDuration, formatDate } from '@/lib/utils'

async function getDashboardStats(organizationId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalCalls, callsThisMonth, appointmentsBooked, voicemails, recentCalls] = await Promise.all([
    prisma.callLog.count({ where: { organizationId } }),
    prisma.callLog.count({ where: { organizationId, createdAt: { gte: startOfMonth } } }),
    prisma.callLog.count({ where: { organizationId, appointmentBooked: true } }),
    prisma.callLog.count({ where: { organizationId, voicemailLeft: true } }),
    prisma.callLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  return { totalCalls, callsThisMonth, appointmentsBooked, voicemails, recentCalls }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId

  const stats = orgId
    ? await getDashboardStats(orgId)
    : { totalCalls: 0, callsThisMonth: 0, appointmentsBooked: 0, voicemails: 0, recentCalls: [] }

  const statCards = [
    { label: 'Calls This Month', value: stats.callsThisMonth.toString(), icon: Phone, color: 'text-blue-600 bg-blue-50', change: '+12%' },
    { label: 'Appointments Booked', value: stats.appointmentsBooked.toString(), icon: Calendar, color: 'text-purple-600 bg-purple-50', change: '+8%' },
    { label: 'Voicemails', value: stats.voicemails.toString(), icon: Mic, color: 'text-orange-600 bg-orange-50', change: '-3%' },
    { label: 'Total Calls', value: stats.totalCalls.toString(), icon: TrendingUp, color: 'text-green-600 bg-green-50', change: '+24%' },
  ]

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    'no-answer': 'bg-gray-100 text-gray-600',
    busy: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/dashboard/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-ledo-600 text-white text-sm font-medium rounded-lg hover:bg-ledo-700 transition-colors">
          <Phone className="w-4 h-4" />
          Setup Phone
        </Link>
      </div>

      {!orgId && (
        <div className="bg-gradient-to-r from-ledo-600 to-ledo-800 rounded-2xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-1">Complete your setup</h3>
          <p className="text-ledo-200 text-sm mb-4">Connect a phone number to start answering calls with AI.</p>
          <Link href="/onboarding" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-ledo-700 text-sm font-semibold rounded-lg hover:bg-ledo-50 transition-colors">
            Continue Setup <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                {card.change}
              </span>
            </div>
            <div className="text-3xl font-display font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Calls</h2>
          <Link href="/dashboard/calls" className="text-sm text-ledo-600 hover:underline font-medium">View all →</Link>
        </div>
        {stats.recentCalls.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No calls yet. Set up your phone number to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(stats.recentCalls as any[]).map((call) => (
              <div key={call.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-ledo-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-ledo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{formatPhone(call.from)}</p>
                  <p className="text-xs text-gray-400">{formatDate(call.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {call.appointmentBooked && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Booked
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDuration(call.duration)}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[call.status] || 'bg-gray-100 text-gray-600'}`}>
                    {call.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
