import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Stripe requires the raw body for signature verification.
async function readRawBody(req: NextRequest): Promise<string> {
  const ab = await req.arrayBuffer()
  return Buffer.from(ab).toString('utf8')
}

async function applySubscription(sub: Stripe.Subscription) {
  const orgId = (sub.metadata?.organizationId as string) || null
  const plan = (sub.metadata?.plan as string) || null

  // Map by metadata first, then by Stripe customer ID.
  let org = orgId
    ? await prisma.organization.findUnique({ where: { id: orgId } })
    : null
  if (!org && typeof sub.customer === 'string') {
    org = await prisma.organization.findFirst({ where: { stripeCustomerId: sub.customer } })
  }
  if (!org) {
    console.warn('Stripe webhook: no matching organization for sub', sub.id)
    return
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      stripeSubscriptionId: sub.id,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : org.stripeCustomerId,
      planId: plan || org.planId,
      planStatus: sub.status,
    },
  })
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const sig = req.headers.get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!secret) return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })

  let event: Stripe.Event
  try {
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(raw, sig, secret)
  } catch (err: any) {
    console.error('Stripe signature verification failed:', err?.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sessionObj = event.data.object as Stripe.Checkout.Session
        const orgId = (sessionObj.metadata?.organizationId as string) || null
        const plan = (sessionObj.metadata?.plan as string) || null
        const customerId =
          typeof sessionObj.customer === 'string' ? sessionObj.customer : null
        const subId =
          typeof sessionObj.subscription === 'string' ? sessionObj.subscription : null
        if (orgId) {
          await prisma.organization.update({
            where: { id: orgId },
            data: {
              stripeCustomerId: customerId || undefined,
              stripeSubscriptionId: subId || undefined,
              planId: plan || undefined,
              planStatus: 'active',
            },
          })
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await applySubscription(event.data.object as Stripe.Subscription)
        break
      }
      default:
        break
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
