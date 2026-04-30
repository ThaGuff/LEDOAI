import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const data: { isSuperAdmin?: boolean; role?: string } = {}
  if (typeof body.isSuperAdmin === 'boolean') data.isSuperAdmin = body.isSuperAdmin
  if (typeof body.role === 'string' && ['owner', 'member', 'admin'].includes(body.role)) data.role = body.role
  const user = await prisma.user.update({ where: { id: params.id }, data })
  return NextResponse.json({ user })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (admin.id === params.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
  }
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
