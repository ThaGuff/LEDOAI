import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  _stripe = new Stripe(key, { apiVersion: '2024-06-20' as any })
  return _stripe
}

export type PlanId = 'starter' | 'pro' | 'business'

export const PLANS: Record<PlanId, {
  id: PlanId
  name: string
  price: number
  priceLabel: string
  features: string[]
  envVar: string
  popular?: boolean
}> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    priceLabel: '$49',
    features: [
      'Up to 100 calls/mo',
      'Inbound answering',
      'Voicemail capture',
      'Email notifications',
      'Knowledge base',
    ],
    envVar: 'STRIPE_PRICE_STARTER',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 149,
    priceLabel: '$149',
    popular: true,
    features: [
      'Up to 500 calls/mo',
      'Appointment booking',
      'Live call transfer',
      'SMS + email alerts',
      'CRM integration (HubSpot)',
      'Custom AI personality',
    ],
    envVar: 'STRIPE_PRICE_PRO',
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 399,
    priceLabel: '$399',
    features: [
      'Unlimited calls',
      'Multi-location support',
      'Knowledge base scraping',
      'Google Sheets sync',
      'Priority support',
      'Audit logs + SSO',
    ],
    envVar: 'STRIPE_PRICE_BUSINESS',
  },
}

export function getPriceId(plan: PlanId): string | null {
  return process.env[PLANS[plan].envVar] || null
}
