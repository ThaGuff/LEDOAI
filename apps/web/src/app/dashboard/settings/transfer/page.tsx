import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/settings/SettingsForm'

export default async function TransferSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null

  return (
    <SettingsForm
      endpoint="/api/settings"
      title="Call Transfer"
      description="When a caller asks to speak with a human, LEDO AI will transfer to this number"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Live transfer phone number</label>
        <input
          type="tel"
          name="transferNumber"
          defaultValue={org?.transferNumber || ''}
          placeholder="+15551234567"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Use E.164 format (e.g. +15551234567). Leave blank to disable live transfers.
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-900">
        <p className="font-medium mb-1">When transfers happen</p>
        <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
          <li>Caller explicitly asks to speak with a person</li>
          <li>LEDO AI cannot answer the question with confidence</li>
          <li>Caller mentions an emergency or urgent issue</li>
        </ul>
      </div>
    </SettingsForm>
  )
}
