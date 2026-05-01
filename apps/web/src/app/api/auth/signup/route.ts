import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SignupSchema = z.object({
  firstName: z.string().trim().max(100).optional().default(''),
  lastName: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email().toLowerCase().max(254),
  businessName: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(128),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = SignupSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { firstName, lastName, email, businessName, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const slug =
      businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) +
      '-' +
      Date.now().toString(36)

    const hashedPassword = await bcrypt.hash(password, 12)

    // Atomic: create org + user together so neither orphans on failure.
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: businessName,
          slug,
          planId: 'starter',
          planStatus: 'trialing',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          notificationSettings: {
            create: {
              emailEnabled: true,
              notifyOnCall: true,
              notifyOnVoicemail: true,
              notifyOnAppointment: true,
              recipientEmails: [email],
              recipientPhones: [],
            },
          },
        },
      })
      const user = await tx.user.create({
        data: {
          name: `${firstName} ${lastName}`.trim() || null,
          email,
          password: hashedPassword,
          role: 'owner',
          organizationId: org.id,
        },
      })
      return { org, user }
    })

    return NextResponse.json(
      { user: { id: result.user.id, email: result.user.email, organizationId: result.org.id } },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email or business slug already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
