import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'workspace'
  )
}

async function ensureOrganizationForUser(userId: string, email: string, displayName?: string | null) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return
  if (user.organizationId) return

  // Derive a sensible workspace name from email or display name.
  const baseName = displayName || email.split('@')[0] || 'My Workspace'
  const slug = `${slugify(baseName)}-${Date.now().toString(36)}`

  const org = await prisma.organization.create({
    data: {
      name: `${baseName}'s Workspace`,
      slug,
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

  await prisma.user.update({
    where: { id: userId },
    data: {
      organizationId: org.id,
      role: 'owner',
    },
  })
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email!, name: user.name, image: user.image }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      // Ensure every signed-in user has an Organization (covers Google OAuth signups).
      if (user?.id && user?.email) {
        try {
          await ensureOrganizationForUser(user.id, user.email, user.name)
        } catch (e) {
          console.error('ensureOrganizationForUser failed:', e)
        }
      }
    },
    async createUser({ user }) {
      if (user?.id && user?.email) {
        try {
          await ensureOrganizationForUser(user.id, user.email, user.name)
        } catch (e) {
          console.error('createUser ensureOrganization failed:', e)
        }
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      // Defensive: guarantee org exists before granting session.
      if (user?.id && user?.email) {
        try {
          await ensureOrganizationForUser(user.id, user.email, user.name)
        } catch (e) {
          console.error('signIn ensureOrganization failed:', e)
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      // On initial sign-in or when the session is updated, refresh from DB.
      const userId = (user?.id as string | undefined) || (token.id as string | undefined)
      if (userId && (user || trigger === 'update' || !token.organizationId)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            organizationId: true,
            isSuperAdmin: true,
          },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.email = dbUser.email
          token.name = dbUser.name
          token.picture = dbUser.image
          token.organizationId = dbUser.organizationId || undefined
          token.role = dbUser.role || undefined
          token.isSuperAdmin = dbUser.isSuperAdmin || false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string | undefined
        session.user.role = token.role as string | undefined
      }
      return session
    },
  },
}
