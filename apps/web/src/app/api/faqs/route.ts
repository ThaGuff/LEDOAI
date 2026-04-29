import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const faqs = await prisma.fAQ.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ faqs })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { question, answer } = await req.json()
  if (!question || !answer) {
    return NextResponse.json({ error: 'question and answer required' }, { status: 400 })
  }
  const faq = await prisma.fAQ.create({
    data: { question, answer, organizationId: session.user.organizationId },
  })
  return NextResponse.json({ faq }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await req.json()
  await prisma.fAQ.deleteMany({
    where: { id, organizationId: session.user.organizationId },
  })
  return NextResponse.json({ success: true })
}
