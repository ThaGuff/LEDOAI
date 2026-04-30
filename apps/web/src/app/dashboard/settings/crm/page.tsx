import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft, Plug } from 'lucide-react'

export default async function CrmSettingsPage() {
  const session = await getServerSession(authOptions)
  const connected = false // placeholder until OAuth flow is implemented

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">CRM Integration</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sync new contacts and call data automatically to your CRM</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
            <Plug className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">HubSpot</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Push every new caller as a contact, and log call summaries as engagements.
            </p>
            <div className="mt-4">
              {connected ? (
                <button className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium" disabled>
                  Disconnect
                </button>
              ) : (
                <Link
                  href={session?.user ? '/api/integrations/hubspot/connect' : '/auth/signin'}
                  className="inline-block px-4 py-2 bg-ledo-600 text-white hover:bg-ledo-700 rounded-lg text-sm font-medium"
                >
                  Connect HubSpot
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-60">
        <p className="font-semibold text-gray-900">More integrations</p>
        <p className="text-sm text-gray-500 mt-1">Salesforce, Pipedrive, Zoho, GoHighLevel — coming soon.</p>
      </div>
    </div>
  )
}
