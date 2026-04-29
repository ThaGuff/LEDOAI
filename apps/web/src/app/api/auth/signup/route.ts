import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, businessName } = body

    if (!email || !businessName) {
      return NextResponse.json({ error: 'email and businessName required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Create org slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36)

    const org = await prisma.organization.create({
      data: {
        name: businessName,
        slug,
        notificationSettings: {
          create: {
            emailEnabled: true,
            notifyOnCall: true,
            notifyOnVoicemail: true,
            notifyOnAppointment: true,
            recipientEmails: JSON.stringify([email]),
            recipientPhones: JSON.stringify([]),
          },
        },
      },
    })

    const user = await prisma.user.create({
      data: {
        name: `${firstName || ''} ${lastName || ''}`.trim() || null,
        email,
        role: 'owner',
        organizationId: org.id,
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, organizationId: org.id } }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
