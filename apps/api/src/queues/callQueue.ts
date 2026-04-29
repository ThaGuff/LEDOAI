import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { generateCallSummary, detectCallIntent } from '../services/callSummaryService'
import { sendNotification } from '../services/notificationService'
import { upsertHubSpotContact, createHubSpotNote } from '../services/hubspotService'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

// Queue for post-call processing
export const callProcessingQueue = new Queue('call-processing', { connection })

export function startCallWorker() {
  const worker = new Worker(
    'call-processing',
    async (job) => {
      const { callSid, transcript, callerPhone, organizationId, duration, recordingUrl } = job.data

      console.log(`Processing call ${callSid}`)

      // 1. Generate AI summary
      const summary = await generateCallSummary(transcript || '')
      const intent = await detectCallIntent(transcript || '')

      // 2. Update call log in DB via internal API (or directly via Prisma if shared)
      // For now, log results
      console.log(`Call ${callSid} summary:`, summary, 'intent:', intent)

      // 3. Sync to HubSpot
      if (callerPhone && organizationId) {
        const contactId = await upsertHubSpotContact({
          phone: callerPhone,
          notes: summary,
          source: 'LEDO AI Call',
        })
        if (contactId && summary) {
          await createHubSpotNote(contactId, `LEDO AI Call Summary:\n${summary}\n\nTranscript:\n${transcript}`)
        }
      }

      // 4. Send notification (fetch org notification settings from API)
      // This is a simplified version - in production, fetch from DB
      await sendNotification({
        type: 'call_summary',
        recipientEmails: [],   // Populated from org settings in production
        recipientPhones: [],
        data: {
          callerNumber: callerPhone,
          summary,
          transcript,
          callDuration: duration,
          recordingUrl,
        },
      })
    },
    { connection, concurrency: 5 }
  )

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err)
  })

  return worker
}
