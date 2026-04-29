import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateCallSummary(transcript: string): Promise<string> {
  if (!transcript || transcript.length < 10) return 'No summary available.'

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a business call summarizer. Given a call transcript, produce a concise 2-3 sentence summary covering:
1. The caller's name (if mentioned)
2. Their reason for calling
3. The outcome (appointment booked, question answered, voicemail, transfer, etc.)

Be factual and brief. Do not include greetings or filler.`,
        },
        { role: 'user', content: `Transcript:\n${transcript}` },
      ],
      temperature: 0.3,
      max_tokens: 150,
    })
    return completion.choices[0].message.content || 'No summary available.'
  } catch (error) {
    console.error('Summary generation error:', error)
    return 'Summary unavailable.'
  }
}

export async function detectCallIntent(transcript: string): Promise<string> {
  if (!transcript) return 'unknown'

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Classify the caller's primary intent into exactly one of these categories:
inquiry, appointment, complaint, sales, support, voicemail, transfer, unknown

Respond with only the category word.`,
        },
        { role: 'user', content: transcript.slice(0, 500) },
      ],
      temperature: 0,
      max_tokens: 10,
    })
    const intent = completion.choices[0].message.content?.trim().toLowerCase() || 'unknown'
    const valid = ['inquiry', 'appointment', 'complaint', 'sales', 'support', 'voicemail', 'transfer', 'unknown']
    return valid.includes(intent) ? intent : 'unknown'
  } catch {
    return 'unknown'
  }
}
