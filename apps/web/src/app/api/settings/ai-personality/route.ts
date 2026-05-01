import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KnowledgeSourceSchema = z.object({
  type: z.enum(['url', 'sheet', 'manual']),
  url: z.string().url().max(2000).optional(),
  label: z.string().max(120).optional(),
})

const PersonalitySchema = z.object({
  aiAgentName: z.string().trim().max(40).default('LEDO'),
  aiVoice: z.string().trim().max(80).default('Polly.Joanna-Neural'),
  aiLanguage: z.string().trim().max(10).default('en-US'),
  aiTone: z.enum(['professional', 'friendly', 'empathetic', 'enthusiastic', 'concise']).default('professional'),
  aiResponseLength: z.enum(['short', 'medium', 'long']).default('medium'),
  aiCreativity: z.number().min(0).max(1).default(0.7),
  aiCustomInstructions: z.string().max(4000).default(''),
  aiFallbackBehavior: z.enum(['transfer', 'voicemail', 'end']).default('transfer'),
  aiUseKnowledgeBase: z.boolean().default(true),
  aiKnowledgeSources: z.array(KnowledgeSourceSchema).max(20).default([]),
  aiBusinessAddress: z.string().max(300).default(''),
  aiBusinessServices: z.string().max(2000).default(''),
  aiBusinessPricing: z.string().max(1500).default(''),
  greeting: z.string().max(500).default(''),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const userId = session?.user?.id
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json().catch(() => null)
    const parsed = PersonalitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const data = parsed.data

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...data,
        // Keep legacy field in sync for any old code paths.
        aiPersonality: data.aiTone,
        aiKnowledgeSources: data.aiKnowledgeSources as unknown as object,
      },
    })

    // Audit log (best-effort, non-blocking on failure)
    try {
      await prisma.auditLog.create({
        data: {
          organizationId: orgId,
          userId: userId || null,
          action: 'ai_personality.updated',
          entityType: 'Organization',
          entityId: orgId,
          metadata: { tone: data.aiTone, voice: data.aiVoice } as object,
        },
      })
    } catch (e) {
      console.warn('Audit log write failed:', e)
    }

    return NextResponse.json({ ok: true, organization: updated })
  } catch (e) {
    console.error('AI personality update error:', e)
    return NextResponse.json({ error: 'Failed to update AI personality' }, { status: 500 })
  }
}
