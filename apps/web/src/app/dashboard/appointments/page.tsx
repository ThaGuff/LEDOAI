import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Calendar, Phone, Clock } from 'lucide-react'
import { formatPhone, formatDate } from '@/lib/utils'

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId

  const appointments = orgId
    ? await prisma.appointment.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        include: { callLog: { select: { from: true } } },
      })
    : []

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Appointments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Appointments booked by LEDO AI during calls</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 mb-1">No appointments yet</h3>
            <p className="text-sm text-gray-400">When LEDO AI books appointments during calls, they&apos;ll appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(appointments as any[]).map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/30">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{apt.callerName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      {formatPhone(apt.callerPhone)}
                    </span>
                    {apt.scheduledAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(apt.scheduledAt)}
                      </span>
                    )}
                  </div>
                  {apt.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{apt.notes}</p>}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
