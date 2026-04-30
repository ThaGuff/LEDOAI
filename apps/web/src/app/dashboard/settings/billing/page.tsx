import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    interval: '/mo',
    features: ['Up to 100 calls/mo', 'Inbound answering', 'Voicemail capture', 'Email notifications'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$149',
    interval: '/mo',
    features: ['Up to 500 calls/mo', 'Appointment booking', 'Live call transfer', 'SMS + email alerts', 'CRM integration'],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$399',
    interval: '/mo',
    features: ['Unlimited calls', 'Custom AI personality', 'Knowledge base scraping', 'Priority support', 'Multi-location'],
  },
]

export default async function BillingPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null
  const currentPlan = org?.planId || 'starter'

  const callCount = orgId
    ? await prisma.callLog.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      })
    : 0

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Billing &amp; Plan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your subscription and view usage</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5 capitalize">{currentPlan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Calls this month</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5">{callCount}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border shadow-sm p-6 relative ${plan.popular ? 'border-ledo-500 ring-2 ring-ledo-100' : 'border-gray-100'}`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-ledo-600 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              )}
              <p className="text-lg font-display font-bold text-gray-900">{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500">{plan.interval}</span>
              </div>
              <ul className="mt-5 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-ledo-600 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent}
                className={`w-full mt-6 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-ledo-600 text-white hover:bg-ledo-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isCurrent ? 'Current plan' : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
        Stripe checkout integration is coming soon. Contact support@ledo.ai to upgrade your plan.
      </div>
    </div>
  )
}
