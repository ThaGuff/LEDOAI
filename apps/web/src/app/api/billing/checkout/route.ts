import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe, getPriceId, PLANS, PlanId } from '@/lib/stripe'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Body = z.object({
  plan: z.enum(['starter', 'pro', 'business']),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const email = session?.user?.email
  if (!orgId || !email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      { status: 503 },
    )
  }

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  const plan: PlanId = parsed.data.plan

  const priceId = getPriceId(plan)
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID not configured for ${plan}. Set ${PLANS[plan].envVar}.` },
      { status: 503 },
    )
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  // Reuse existing Stripe customer or create one.
  let customerId = org.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: org.name,
      metadata: { organizationId: org.id },
    })
    customerId = customer.id
    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustomerId: customerId },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ledo.ai'

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/settings/billing?success=1`,
    cancel_url: `${baseUrl}/dashboard/settings/billing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { organizationId: org.id, plan },
    },
    metadata: { organizationId: org.id, plan },
  })

  return NextResponse.json({ url: checkout.url })
}
