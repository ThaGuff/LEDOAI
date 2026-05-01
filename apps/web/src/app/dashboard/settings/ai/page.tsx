import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AiPersonalityForm, AiPersonalityInitial } from '@/components/settings/AiPersonalityForm'

export const dynamic = 'force-dynamic'

export default async function AiSettingsPage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : null

  const initial: AiPersonalityInitial = {
    aiAgentName: org?.aiAgentName || 'LEDO',
    aiVoice: org?.aiVoice || 'Polly.Joanna-Neural',
    aiLanguage: org?.aiLanguage || 'en-US',
    aiTone: org?.aiTone || org?.aiPersonality || 'professional',
    aiResponseLength: org?.aiResponseLength || 'medium',
    aiCreativity: org?.aiCreativity ?? 0.7,
    aiCustomInstructions: org?.aiCustomInstructions || '',
    aiFallbackBehavior: org?.aiFallbackBehavior || 'transfer',
    aiUseKnowledgeBase: org?.aiUseKnowledgeBase ?? true,
    aiKnowledgeSources:
      ((org?.aiKnowledgeSources as unknown) as AiPersonalityInitial['aiKnowledgeSources']) || [],
    aiBusinessAddress: org?.aiBusinessAddress || '',
    aiBusinessServices: org?.aiBusinessServices || '',
    aiBusinessPricing: org?.aiBusinessPricing || '',
    greeting: org?.greeting || '',
  }

  return <AiPersonalityForm initial={initial} />
}
