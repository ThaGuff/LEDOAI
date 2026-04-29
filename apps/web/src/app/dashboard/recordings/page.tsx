import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Mic, Play, Download } from 'lucide-react'
import { formatPhone, formatDuration, formatDate } from '@/lib/utils'

export default async function RecordingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId

  const calls = orgId
    ? await prisma.callLog.findMany({
        where: { organizationId: orgId, recordingUrl: { not: null } },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Recordings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Listen to and download call recordings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {calls.length === 0 ? (
          <div className="p-16 text-center">
            <Mic className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 mb-1">No recordings yet</h3>
            <p className="text-sm text-gray-400">Call recordings will appear here once your phone is connected.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(calls as any[]).map((call) => (
              <div key={call.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/30">
                <button className="w-9 h-9 rounded-full bg-ledo-100 flex items-center justify-center hover:bg-ledo-200 transition-colors">
                  <Play className="w-4 h-4 text-ledo-600 ml-0.5" />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{formatPhone(call.from)}</p>
                  <p className="text-xs text-gray-400">{formatDate(call.createdAt)} · {formatDuration(call.duration)}</p>
                </div>
                {call.recordingUrl && (
                  <a
                    href={call.recordingUrl}
                    download
                    className="p-2 text-gray-400 hover:text-ledo-600 hover:bg-ledo-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
