import OpenAI from 'openai'
import { prisma } from '../lib/prisma'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })

interface CallResponse {
  action: 'respond' | 'transfer' | 'voicemail' | 'book_appointment' | 'end'
  message?: string
  transferNumber?: string
}

type ConversationTurn = { role: 'user' | 'assistant'; content: string }
type CallContext = { history: ConversationTurn[]; intent?: string; organizationId?: string }

// In-memory call context store. For multi-instance prod, swap for Redis.
const callContexts = new Map<string, CallContext>()

type OrgConfig = {
  id: string
  name: string
  transferNumber: string | null
  greeting: string
  aiAgentName: string
  aiTone: string
  aiResponseLength: string
  aiCreativity: number
  aiCustomInstructions: string
  aiFallbackBehavior: string
  aiUseKnowledgeBase: boolean
  aiBusinessAddress: string | null
  aiBusinessServices: string | null
  aiBusinessPricing: string | null
  businessHours: unknown
  knowledgeSnippets: string
  faqText: string
}

const orgCache = new Map<string, { value: OrgConfig; expires: number }>()
const ORG_CACHE_TTL_MS = 60_000

function getDefaultOrgConfig(): OrgConfig {
  return {
    id: 'default',
    name: 'this business',
    transferNumber: process.env.DEFAULT_TRANSFER_NUMBER || null,
    greeting: 'Thank you for calling. How can I help you today?',
    aiAgentName: 'LEDO',
    aiTone: 'professional',
    aiResponseLength: 'medium',
    aiCreativity: 0.7,
    aiCustomInstructions: '',
    aiFallbackBehavior: 'transfer',
    aiUseKnowledgeBase: false,
    aiBusinessAddress: null,
    aiBusinessServices: null,
    aiBusinessPricing: null,
    businessHours: {},
    knowledgeSnippets: '',
    faqText: '',
  }
}

export async function loadOrgConfig(orgId?: string | null): Promise<OrgConfig> {
  if (!orgId) return getDefaultOrgConfig()
  const cached = orgCache.get(orgId)
  if (cached && cached.expires > Date.now()) return cached.value

  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        knowledgeBase: { where: { active: true }, take: 20, orderBy: { updatedAt: 'desc' } },
        faqs: { where: { active: true }, take: 30, orderBy: { updatedAt: 'desc' } },
      },
    })
    if (!org) return getDefaultOrgConfig()

    const knowledgeSnippets = org.aiUseKnowledgeBase
      ? org.knowledgeBase
          .map((k) => `### ${k.title}\n${k.content.slice(0, 1500)}`)
          .join('\n\n')
          .slice(0, 12000)
      : ''

    const faqText = org.faqs
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n')
      .slice(0, 6000)

    const config: OrgConfig = {
      id: org.id,
      name: org.name,
      transferNumber: org.transferNumber,
      greeting: org.greeting,
      aiAgentName: org.aiAgentName || 'LEDO',
      aiTone: org.aiTone || org.aiPersonality || 'professional',
      aiResponseLength: org.aiResponseLength || 'medium',
      aiCreativity: org.aiCreativity ?? 0.7,
      aiCustomInstructions: org.aiCustomInstructions || '',
      aiFallbackBehavior: org.aiFallbackBehavior || 'transfer',
      aiUseKnowledgeBase: org.aiUseKnowledgeBase ?? true,
      aiBusinessAddress: org.aiBusinessAddress,
      aiBusinessServices: org.aiBusinessServices,
      aiBusinessPricing: org.aiBusinessPricing,
      businessHours: org.businessHours,
      knowledgeSnippets,
      faqText,
    }
    orgCache.set(orgId, { value: config, expires: Date.now() + ORG_CACHE_TTL_MS })
    return config
  } catch (e) {
    console.error('loadOrgConfig failed, using defaults:', e)
    return getDefaultOrgConfig()
  }
}

function lengthGuidance(length: string): string {
  switch (length) {
    case 'short':
      return 'Keep responses to 1 short sentence (under 15 words).'
    case 'long':
      return 'You may use up to 3 sentences when explaining complex things.'
    default:
      return 'Keep responses to 1-2 sentences (under 35 words).'
  }
}

function toneGuidance(tone: string): string {
  switch (tone) {
    case 'friendly':
      return 'Be warm, casual, and conversational. Use the caller\u2019s name when known.'
    case 'empathetic':
      return 'Listen carefully and acknowledge feelings. Speak gently and reassuringly.'
    case 'enthusiastic':
      return 'Sound upbeat and energetic. Show genuine excitement to help.'
    case 'concise':
      return 'Be direct and brief. Skip pleasantries unless the caller initiates them.'
    default:
      return 'Be polished, courteous, and professional.'
  }
}

function buildSystemPrompt(cfg: OrgConfig): string {
  const sections: string[] = []
  sections.push(
    `You are ${cfg.aiAgentName}, a phone receptionist answering calls for ${cfg.name}.`,
    toneGuidance(cfg.aiTone),
    lengthGuidance(cfg.aiResponseLength),
    'Speak naturally as if on a real phone call. Avoid bullet lists, emoji, and markdown.',
  )

  if (cfg.aiBusinessAddress) sections.push(`Business address: ${cfg.aiBusinessAddress}`)
  if (cfg.aiBusinessServices) sections.push(`Services offered:\n${cfg.aiBusinessServices}`)
  if (cfg.aiBusinessPricing) sections.push(`Pricing notes:\n${cfg.aiBusinessPricing}`)

  if (cfg.businessHours && typeof cfg.businessHours === 'object' && Object.keys(cfg.businessHours as object).length) {
    try {
      sections.push(`Business hours (JSON):\n${JSON.stringify(cfg.businessHours)}`)
    } catch {
      // ignore
    }
  }

  if (cfg.faqText) {
    sections.push(`Frequently Asked Questions \u2014 answer questions using these when relevant:\n${cfg.faqText}`)
  }

  if (cfg.knowledgeSnippets) {
    sections.push(
      `Reference knowledge \u2014 use this to answer questions accurately. If the answer is not here, say you'll have a teammate follow up:\n${cfg.knowledgeSnippets}`,
    )
  }

  if (cfg.aiCustomInstructions) {
    sections.push(`Operator instructions you MUST follow:\n${cfg.aiCustomInstructions}`)
  }

  const fallbackHint =
    cfg.aiFallbackBehavior === 'voicemail'
      ? 'If you cannot help, ask if they would like to leave a voicemail (action: "voicemail").'
      : cfg.aiFallbackBehavior === 'end'
        ? 'If you cannot help, politely end the call (action: "end").'
        : `If the caller asks for a human or you cannot help, transfer the call (action: "transfer", transferNumber: "${cfg.transferNumber || ''}").`

  sections.push(`Routing rules:
- If the caller wants to book an appointment \u2192 action: "book_appointment".
- If they want to leave a message \u2192 action: "voicemail".
- If they want a human or you can't help \u2192 ${fallbackHint}
- If the conversation has wrapped up \u2192 action: "end".
- Otherwise \u2192 action: "respond".`)

  sections.push(`You MUST respond ONLY with strict JSON of this exact shape:
{
  "action": "respond" | "transfer" | "voicemail" | "book_appointment" | "end",
  "message": "what to say to the caller",
  "transferNumber": "+15551234567"
}`)

  return sections.join('\n\n')
}

export async function handleInboundCall(
  callSid: string,
  userInput: string,
  organizationId?: string | null,
): Promise<CallResponse> {
  if (!callContexts.has(callSid)) {
    callContexts.set(callSid, { history: [], organizationId: organizationId || undefined })
  }
  const context = callContexts.get(callSid)!
  if (organizationId && !context.organizationId) context.organizationId = organizationId

  context.history.push({ role: 'user', content: userInput })

  const cfg = await loadOrgConfig(context.organizationId)
  const systemPrompt = buildSystemPrompt(cfg)

  if (!process.env.OPENAI_API_KEY) {
    return {
      action: 'respond',
      message: "I'm sorry, my AI service isn't configured yet. Please leave a message after the tone.",
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...context.history.slice(-12).map((h) => ({ role: h.role, content: h.content })),
      ],
      temperature: Math.min(1, Math.max(0, cfg.aiCreativity)),
      max_tokens: cfg.aiResponseLength === 'long' ? 220 : cfg.aiResponseLength === 'short' ? 80 : 140,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    let response: CallResponse
    try {
      response = JSON.parse(responseText) as CallResponse
    } catch {
      response = { action: 'respond', message: responseText.slice(0, 280) }
    }

    if (response.action === 'transfer' && !response.transferNumber) {
      response.transferNumber = cfg.transferNumber || undefined
      if (!response.transferNumber) {
        response.action = 'voicemail'
        response.message =
          response.message ||
          "I'd love to connect you, but no one is available to take that call. Please leave a message after the tone."
      }
    }

    context.history.push({ role: 'assistant', content: response.message || '' })
    return response
  } catch (error) {
    console.error('OpenAI error:', error)
    return {
      action: 'respond',
      message: "I'm sorry, I'm having trouble processing your request. Would you like me to transfer you?",
    }
  }
}

export function getCallContext(callSid: string) {
  return callContexts.get(callSid)
}

export function getCallTranscript(callSid: string): string {
  const ctx = callContexts.get(callSid)
  if (!ctx) return ''
  return ctx.history
    .map((h) => `${h.role === 'user' ? 'Caller' : 'Agent'}: ${h.content}`)
    .join('\n')
}

export function clearCallContext(callSid: string) {
  callContexts.delete(callSid)
}
