import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { KnowledgeManager } from '@/components/knowledge/KnowledgeManager'

export default async function KnowledgePage() {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  const items = orgId
    ? await prisma.knowledgeBase.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Add business information for LEDO AI to reference when answering caller questions
        </p>
      </div>
      <KnowledgeManager
        initialItems={items.map((i) => ({
          id: i.id,
          title: i.title,
          content: i.content,
          type: i.type,
          sourceUrl: i.sourceUrl,
          active: i.active,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
