import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await prisma.knowledgeBase.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, content, type, sourceUrl } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  const item = await prisma.knowledgeBase.create({
    data: {
      organizationId: orgId,
      title: title.slice(0, 200),
      content: content.slice(0, 50000),
      type: type || 'manual',
      sourceUrl: sourceUrl || null,
    },
  })
  return NextResponse.json({ item }, { status: 201 })
}
