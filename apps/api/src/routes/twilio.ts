import { Router, Request, Response } from 'express'
import twilio from 'twilio'
const { VoiceResponse } = twilio.twiml
import { handleInboundCall, getCallTranscript, loadOrgConfig, clearCallContext } from '../services/callHandler'
import { prisma } from '../lib/prisma'
import { sendNotification } from '../services/notificationService'
import { generateCallSummary, detectCallIntent } from '../services/callSummaryService'
import { upsertHubSpotContact, createHubSpotNote } from '../services/hubspotService'

export const twilioRoutes = Router()

const PUBLIC_BASE = process.env.API_PUBLIC_URL || ''

function actionUrl(path: string, callSid: string, orgId?: string | null) {
  const base = PUBLIC_BASE ? `${PUBLIC_BASE.replace(/\/$/, '')}` : ''
  const orgQuery = orgId ? `&orgId=${encodeURIComponent(orgId)}` : ''
  return `${base}${path}?callSid=${encodeURIComponent(callSid)}${orgQuery}`
}

// Resolve organization from the dialed Twilio number.
async function resolveOrgFromTo(to?: string) {
  if (!to) return null
  try {
    return await prisma.organization.findUnique({ where: { twilioPhoneNumber: to } })
  } catch (e) {
    console.warn('resolveOrgFromTo failed:', e)
    return null
  }
}

// Best-effort upsert of CallLog so we always have a record.
async function ensureCallLog(callSid: string, from: string, to: string, organizationId: string) {
  try {
    await prisma.callLog.upsert({
      where: { callSid },
      update: { from, to },
      create: {
        callSid,
        from: from || 'unknown',
        to: to || 'unknown',
        organizationId,
        status: 'in-progress',
      },
    })
  } catch (e) {
    console.warn('ensureCallLog failed:', e)
  }
}

// Inbound call webhook from Twilio.
twilioRoutes.post('/inbound', async (req: Request, res: Response) => {
  const twiml = new VoiceResponse()
  try {
    const callSid = req.body.CallSid as string
    const from = (req.body.From as string) || 'unknown'
    const to = (req.body.To as string) || 'unknown'
    console.log(`Inbound call: ${callSid} from ${from} to ${to}`)

    const org = await resolveOrgFromTo(to)
    if (org) await ensureCallLog(callSid, from, to, org.id)

    const cfg = await loadOrgConfig(org?.id || null)

    const gather = twiml.gather({
      input: ['speech'],
      speechTimeout: 'auto',
      action: actionUrl('/twilio/process-speech', callSid, org?.id),
      method: 'POST',
      language: cfg.aiLanguage as any || 'en-US',
      enhanced: true,
      speechModel: 'phone_call',
    } as any)

    gather.say({ voice: 'Polly.Joanna-Neural' as any, language: 'en-US' as any }, cfg.greeting)

    twiml.redirect(actionUrl('/twilio/inbound', callSid, org?.id))
    res.type('text/xml').send(twiml.toString())
  } catch (error) {
    console.error('Inbound call error:', error)
    twiml.say('Sorry, we are experiencing technical difficulties. Please try again later.')
    res.type('text/xml').send(twiml.toString())
  }
})

// Process speech input.
twilioRoutes.post('/process-speech', async (req: Request, res: Response) => {
  const twiml = new VoiceResponse()
  try {
    const speechResult = req.body.SpeechResult as string | undefined
    const callSid = req.query.callSid as string
    const orgId = (req.query.orgId as string) || null

    if (!speechResult) {
      twiml.say({ voice: 'Polly.Joanna-Neural' as any }, "I didn't catch that. Could you please repeat?")
      twiml.redirect(actionUrl('/twilio/inbound', callSid, orgId))
      return res.type('text/xml').send(twiml.toString())
    }

    const response = await handleInboundCall(callSid, speechResult, orgId)

    if (response.action === 'respond') {
      const gather = twiml.gather({
        input: ['speech'],
        speechTimeout: 'auto',
        action: actionUrl('/twilio/process-speech', callSid, orgId),
        method: 'POST',
        language: 'en-US',
      } as any)
      gather.say({ voice: 'Polly.Joanna-Neural' as any }, response.message || '')
    } else if (response.action === 'transfer' && response.transferNumber) {
      twiml.say({ voice: 'Polly.Joanna-Neural' as any }, response.message || 'Let me transfer you now. One moment please.')
      try {
        await prisma.callLog.update({ where: { callSid }, data: { transferred: true } })
      } catch {}
      twiml.dial(response.transferNumber)
    } else if (response.action === 'voicemail') {
      twiml.say({ voice: 'Polly.Joanna-Neural' as any }, response.message || 'Please leave your message after the tone.')
      twiml.record({
        action: actionUrl('/twilio/voicemail-done', callSid, orgId),
        maxLength: 120,
        transcribe: true,
        transcribeCallback: actionUrl('/twilio/transcription', callSid, orgId),
      } as any)
    } else if (response.action === 'book_appointment') {
      const gather = twiml.gather({
        input: ['speech'],
        speechTimeout: 'auto',
        action: actionUrl('/twilio/process-speech', callSid, orgId),
        method: 'POST',
      } as any)
      gather.say({ voice: 'Polly.Joanna-Neural' as any }, response.message || 'Sure, what date and time works best?')
    } else {
      twiml.say(
        { voice: 'Polly.Joanna-Neural' as any },
        response.message || 'Thank you for calling. Have a great day!',
      )
      twiml.hangup()
    }

    res.type('text/xml').send(twiml.toString())
  } catch (error) {
    console.error('Process speech error:', error)
    twiml.say(
      { voice: 'Polly.Joanna-Neural' as any },
      'I apologize for the inconvenience. Goodbye.',
    )
    twiml.hangup()
    res.type('text/xml').send(twiml.toString())
  }
})

// Voicemail completion.
twilioRoutes.post('/voicemail-done', async (req: Request, res: Response) => {
  const twiml = new VoiceResponse()
  const callSid = req.query.callSid as string
  try {
    await prisma.callLog.update({
      where: { callSid },
      data: {
        voicemailLeft: true,
        recordingUrl: (req.body.RecordingUrl as string) || undefined,
        recordingSid: (req.body.RecordingSid as string) || undefined,
      },
    })
  } catch (e) {
    console.warn('voicemail-done update failed:', e)
  }
  twiml.say(
    { voice: 'Polly.Joanna-Neural' as any },
    'Thank you for your message. We will get back to you shortly. Goodbye!',
  )
  twiml.hangup()
  res.type('text/xml').send(twiml.toString())
})

// Status callback from Twilio.
twilioRoutes.post('/status', async (req: Request, res: Response) => {
  const callSid = req.body.CallSid as string
  const callStatus = req.body.CallStatus as string
  const duration = parseInt((req.body.CallDuration as string) || '0', 10) || 0
  console.log('Call status:', callStatus, callSid, 'duration:', duration)

  try {
    const updated = await prisma.callLog.update({
      where: { callSid },
      data: { status: callStatus, duration },
      include: { organization: { include: { notificationSettings: true } } },
    })

    if (callStatus === 'completed') {
      // Generate summary + intent in background, then notify and clear context.
      ;(async () => {
        try {
          const transcript = getCallTranscript(callSid) || updated.transcript || ''
          const [summary, intent] = await Promise.all([
            generateCallSummary(transcript),
            detectCallIntent(transcript),
          ])

          const final = await prisma.callLog.update({
            where: { callSid },
            data: { summary, intent, transcript: transcript || undefined },
            include: { organization: { include: { notificationSettings: true } } },
          })

          const ns = final.organization.notificationSettings
          if (ns) {
            const emails = (ns.recipientEmails as unknown as string[]) || []
            const phones = (ns.recipientPhones as unknown as string[]) || []
            if (ns.notifyOnCall) {
              await sendNotification({
                type: 'call_summary',
                recipientEmails: ns.emailEnabled ? emails : [],
                recipientPhones: ns.smsEnabled ? phones : [],
                data: {
                  callerNumber: final.from,
                  callDuration: final.duration,
                  summary,
                  transcript,
                  businessName: final.organization.name,
                  recordingUrl: final.recordingUrl || undefined,
                },
              })
            }
            if (final.voicemailLeft && ns.notifyOnVoicemail) {
              await sendNotification({
                type: 'voicemail',
                recipientEmails: ns.emailEnabled ? emails : [],
                recipientPhones: ns.smsEnabled ? phones : [],
                data: {
                  callerNumber: final.from,
                  transcript,
                  recordingUrl: final.recordingUrl || undefined,
                  businessName: final.organization.name,
                },
              })
            }
          }

          // CRM sync (non-blocking).
          try {
            const contactId = await upsertHubSpotContact({
              phone: final.from,
              notes: summary,
              source: 'LEDO AI Call',
            })
            if (contactId && summary) {
              await createHubSpotNote(
                contactId,
                `LEDO AI Call Summary:\n${summary}\n\nTranscript:\n${transcript}`,
              )
            }
          } catch (e) {
            console.warn('HubSpot sync failed:', e)
          }
        } catch (e) {
          console.error('Post-call processing failed:', e)
        } finally {
          clearCallContext(callSid)
        }
      })().catch((e) => console.error('Async post-call task failed:', e))
    }
  } catch (e) {
    console.warn('status update failed:', e)
  }

  res.sendStatus(200)
})

// Recording callback.
twilioRoutes.post('/recording', async (req: Request, res: Response) => {
  const callSid = req.body.CallSid as string
  try {
    await prisma.callLog.update({
      where: { callSid },
      data: {
        recordingUrl: (req.body.RecordingUrl as string) || undefined,
        recordingSid: (req.body.RecordingSid as string) || undefined,
      },
    })
  } catch (e) {
    console.warn('recording update failed:', e)
  }
  res.sendStatus(200)
})

// Transcription callback.
twilioRoutes.post('/transcription', async (req: Request, res: Response) => {
  const callSid = req.query.callSid as string
  const text = (req.body.TranscriptionText as string) || ''
  try {
    if (text) {
      await prisma.callLog.update({
        where: { callSid },
        data: { transcript: text },
      })
    }
  } catch (e) {
    console.warn('transcription update failed:', e)
  }
  res.sendStatus(200)
})
