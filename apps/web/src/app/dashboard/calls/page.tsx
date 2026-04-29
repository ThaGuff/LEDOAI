import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Phone, Clock, Mic, ArrowLeftRight, CheckCircle } from 'lucide-react'
import { formatPhone, formatDuration, formatDate } from '@/lib/utils'

export default async function CallsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId

  const calls = orgId
    ? await prisma.callLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    : []

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    'no-answer': 'bg-gray-100 text-gray-600',
    busy: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Call Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">All inbound calls handled by LEDO AI</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {calls.length === 0 ? (
          <div className="p-16 text-center">
            <Phone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 mb-1">No calls yet</h3>
            <p className="text-sm text-gray-400">Once your phone number is connected, calls will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Caller</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date &amp; Time</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Duration</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(calls as any[]).map((call) => (
                <tr key={call.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ledo-100 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-ledo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatPhone(call.from)}</p>
                        <p className="text-xs text-gray-400">{call.intent || 'inquiry'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatDate(call.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatDuration(call.duration)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium w-fit ${statusColors[call.status] || 'bg-gray-100 text-gray-600'}`}>
                        {call.status}
                      </span>
                      <div className="flex gap-1.5">
                        {call.appointmentBooked && <span className="text-xs text-green-600"><CheckCircle className="w-3 h-3 inline" /> Booked</span>}
                        {call.voicemailLeft && <span className="text-xs text-orange-500"><Mic className="w-3 h-3 inline" /> VM</span>}
                        {call.transferred && <span className="text-xs text-blue-500"><ArrowLeftRight className="w-3 h-3 inline" /> Transferred</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <a href={`/dashboard/calls/${call.id}`} className="text-sm text-ledo-600 hover:underline font-medium">View →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
