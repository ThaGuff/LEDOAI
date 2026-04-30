import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from '@/components/settings/SettingsForm'

const personalities = [
  { value: 'professional', label: 'Professional', desc: 'Polished, business-appropriate tone' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and conversational' },
  { value: 'concise', label: 'Concise', desc: 'Direct and to the point' },
  { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Upbeat and energetic' },
]

export default async function AiSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null

  return (
    <SettingsForm
      endpoint="/api/settings"
      title="AI Personality"
      description="Customize how LEDO AI greets and speaks with your callers"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Personality</label>
        <div className="grid grid-cols-2 gap-3">
          {personalities.map((p) => (
            <label
              key={p.value}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-ledo-300 has-[:checked]:border-ledo-500 has-[:checked]:bg-ledo-50/40"
            >
              <input
                type="radio"
                name="aiPersonality"
                value={p.value}
                defaultChecked={(org?.aiPersonality || 'professional') === p.value}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Greeting</label>
        <textarea
          name="greeting"
          rows={3}
          defaultValue={org?.greeting || ''}
          placeholder="Thank you for calling Acme Dental. How can I help you today?"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          The first line LEDO AI will say when answering a call.
        </p>
      </div>
    </SettingsForm>
  )
}
