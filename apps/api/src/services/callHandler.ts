import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface CallResponse {
  action: 'respond' | 'transfer' | 'voicemail' | 'book_appointment' | 'end'
  message?: string
  transferNumber?: string
}

// In-memory call context store (replace with Redis in production)
const callContexts = new Map<string, { history: Array<{role: string, content: string}>, intent?: string }>()

export async function handleInboundCall(callSid: string, userInput: string): Promise<CallResponse> {
  // Get or initialize call context
  if (!callContexts.has(callSid)) {
    callContexts.set(callSid, { history: [] })
  }

  const context = callContexts.get(callSid)!
  context.history.push({ role: 'user', content: userInput })

  // System prompt for LEDO AI voice assistant
  const systemPrompt = `You are LEDO, a professional AI voice receptionist. You are helpful, friendly, and efficient.

Your capabilities:
1. Answer common business questions (FAQs about hours, location, services, pricing)
2. Book appointments - ask for name, preferred date/time, and contact info
3. Take voicemails when needed
4. Transfer calls to a human agent when requested or when unable to help
5. Capture lead information

Current business context:
- Business hours: Monday-Friday 9am-6pm, Saturday 10am-4pm
- Location: [Business Address - configure in dashboard]
- Services: [Configure in dashboard]

Respond in a natural, conversational phone voice. Keep responses concise.

IMPORTANT: You MUST respond with valid JSON in this exact format:
{
  "action": "respond" | "transfer" | "voicemail" | "book_appointment" | "end",
  "message": "your spoken response here",
  "transferNumber": "+1234567890" (only if action is transfer)
}

Detect intent:
- If user wants to speak to a human/agent -> action: "transfer"
- If after hours and caller wants to leave message -> action: "voicemail"
- If user wants to book appointment -> action: "book_appointment"
- If call complete -> action: "end"
- Otherwise -> action: "respond"`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...context.history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content || '{}'
    const response = JSON.parse(responseText) as CallResponse

    // Store assistant response in context
    context.history.push({ role: 'assistant', content: response.message || '' })

    return response
  } catch (error) {
    console.error('OpenAI error:', error)
    return {
      action: 'respond',
      message: "I'm sorry, I'm having trouble processing your request. Would you like me to transfer you to someone who can help?",
    }
  }
}

export function clearCallContext(callSid: string) {
  callContexts.delete(callSid)
}
