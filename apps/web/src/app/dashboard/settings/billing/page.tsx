import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { UpgradeButton, ManageSubscriptionButton } from '@/components/billing/BillingActions'

type SearchParams = { success?: string; canceled?: string }

export default async function BillingPage({ searchParams }: { searchParams?: SearchParams }) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null
  const currentPlan = org?.planId || 'starter'
  const planStatus = org?.planStatus || 'trialing'
  const hasSubscription = Boolean(org?.stripeSubscriptionId)
  const trialEnds = org?.trialEndsAt ? new Date(org.trialEndsAt) : null

  const callCount = orgId
    ? await prisma.callLog.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      })
    : 0

  const success = searchParams?.success === '1'
  const canceled = searchParams?.canceled === '1'

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Billing &amp; Plan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your subscription and view usage</p>
        </div>
        <ManageSubscriptionButton hasSubscription={hasSubscription} />
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-900">
          Payment successful. Your plan will update shortly.
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          Checkout canceled. You can try again anytime.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Current plan</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5 capitalize">{currentPlan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5 capitalize">{planStatus}</p>
            {planStatus === 'trialing' && trialEnds && (
              <p className="text-xs text-gray-500 mt-1">Trial ends {trialEnds.toLocaleDateString()}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Calls this month</p>
            <p className="text-xl font-display font-bold text-gray-900 mt-0.5">{callCount}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(Object.values(PLANS)).map((plan) => {
          const isCurrent = plan.id === currentPlan && planStatus !== 'canceled'
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
                <span className="text-3xl font-bold text-gray-900">{plan.priceLabel}</span>
                <span className="text-sm text-gray-500">/mo</span>
              </div>
              <ul className="mt-5 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-ledo-600 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <UpgradeButton plan={plan.id} isCurrent={isCurrent} popular={plan.popular} />
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Secure payments by Stripe. Cancel anytime from the billing portal.
      </p>
    </div>
  )
}
