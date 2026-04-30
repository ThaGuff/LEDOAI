import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/settings/SettingsForm'

export default async function PhoneSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null

  return (
    <SettingsForm
      endpoint="/api/settings"
      title="Phone Setup"
      description="Connect your Twilio phone number to receive AI-handled calls"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Twilio phone number</label>
        <input
          type="tel"
          name="twilioPhoneNumber"
          defaultValue={org?.twilioPhoneNumber || ''}
          placeholder="+15551234567"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Use E.164 format. This number must be configured in Twilio with the LEDO webhook URL.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">Webhook URL</p>
        <code className="text-xs block bg-white border border-blue-100 rounded px-2 py-1.5 font-mono break-all">
          {process.env.NEXT_PUBLIC_API_URL || 'https://ledo-api-production.up.railway.app'}/webhooks/twilio/voice
        </code>
        <p className="text-xs mt-2 text-blue-700">
          Set this as the &quot;A call comes in&quot; webhook in your Twilio console.
        </p>
      </div>
    </SettingsForm>
  )
}
