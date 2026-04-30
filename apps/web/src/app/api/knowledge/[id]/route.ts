import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = await prisma.knowledgeBase.findFirst({ where: { id: params.id, organizationId: orgId } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const updated = await prisma.knowledgeBase.update({
    where: { id: params.id },
    data: {
      title: typeof body.title === 'string' ? body.title.slice(0, 200) : item.title,
      content: typeof body.content === 'string' ? body.content.slice(0, 50000) : item.content,
      active: typeof body.active === 'boolean' ? body.active : item.active,
    },
  })
  return NextResponse.json({ item: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const item = await prisma.knowledgeBase.findFirst({ where: { id: params.id, organizationId: orgId } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.knowledgeBase.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
