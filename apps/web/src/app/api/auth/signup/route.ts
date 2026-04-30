import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    let firstName: string, lastName: string, email: string, businessName: string, password: string

    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      ;({ firstName, lastName, email, businessName, password } = body)
    } else {
      const form = await req.formData()
      firstName = form.get('firstName') as string
      lastName = form.get('lastName') as string
      email = form.get('email') as string
      businessName = form.get('businessName') as string
      password = form.get('password') as string
    }

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

    // Redirect to signin after successful account creation
    return NextResponse.redirect(new URL('/auth/signin?registered=1', req.url), 303)
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
