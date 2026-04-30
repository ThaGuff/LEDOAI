import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, businessName, password } = await req.json()

    if (!email || !businessName || !password) {
      return NextResponse.json({ error: 'email, businessName and password required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

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

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: `${firstName || ''} ${lastName || ''}`.trim() || null,
        email,
        password: hashedPassword,
        role: 'owner',
        organizationId: org.id,
      },
    })

    return NextResponse.json(
      { user: { id: user.id, email: user.email, organizationId: org.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
