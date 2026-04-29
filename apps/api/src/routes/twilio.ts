import { Router, Request, Response } from 'express'
import twilio from 'twilio'
const { VoiceResponse } = twilio.twiml
import { handleInboundCall } from '../services/callHandler'

export const twilioRoutes = Router()

// Inbound call webhook from Twilio
twilioRoutes.post('/inbound', async (req: Request, res: Response) => {
  const twiml = new VoiceResponse()

  try {
    const callSid = req.body.CallSid
    const from = req.body.From
    const to = req.body.To

    console.log(`Inbound call: ${callSid} from ${from} to ${to}`)

    // Greet the caller and gather speech
    const gather = twiml.gather({
      input: ['speech'],
      speechTimeout: 'auto',
      action: `/twilio/process-speech?callSid=${callSid}`,
      method: 'POST',
      language: 'en-US',
      enhanced: true,
      speechModel: 'phone_call',
    })

    gather.say({
      voice: 'Polly.Joanna-Neural',
      language: 'en-US',
    }, `Thank you for calling. I'm LEDO, your AI assistant. How can I help you today?`)

    // If no speech detected
    twiml.redirect('/twilio/inbound')

    res.type('text/xml')
    res.send(twiml.toString())
  } catch (error) {
    console.error('Inbound call error:', error)
    twiml.say('Sorry, we are experiencing technical difficulties. Please try again later.')
    res.type('text/xml')
    res.send(twiml.toString())
  }
})

// Process speech input
twilioRoutes.post('/process-speech', async (req: Request, res: Response) => {
  const twiml = new VoiceResponse()

  try {
    const speechResult = req.body.SpeechResult
    const callSid = req.query.callSid as string
    const confidence = req.body.Confidence

    console.log(`Speech: "${speechResult}" (confidence: ${confidence})`)

    if (!speechResult) {
      twiml.say({ voice: 'Polly.Joanna-Neural' }, "I didn't catch that. Could you please repeat?")
      twiml.redirect(`/twilio/inbound`)
      res.type('text/xml')
      return res.send(twiml.toString())
    }

    // Get AI response
    const response = await handleInboundCall(callSid, speechResult)

    if (response.action === 'respond') {
      const gather = twiml.gather({
        input: ['speech'],
        speechTimeout: 'auto',
        action: `/twilio/process-speech?callSid=${callSid}`,
        method: 'POST',
        language: 'en-US',
      })
      gather.say({ voice: 'Polly.Joanna-Neural' }, response.message || '')
    } else if (response.action === 'transfer') {
      twiml.say({ voice: 'Polly.Joanna-Neural' }, 'Let me transfer you now. One moment please.')
      twiml.dial(response.transferNumber || '')
    } else if (response.action === 'voicemail') {
      twiml.say({ voice: 'Polly.Joanna-Neural' }, 'Please leave your message after the tone.')
      twiml.record({
        action: `/twilio/voicemail-done?callSid=${callSid}`,
        maxLength: 120,
        transcribe: true,
        transcribeCallback: `/twilio/transcription?callSid=${callSid}`,
      })
    } else if (response.action === 'book_appointment') {
      const gather = twiml.gather({
        input: ['speech'],
        speechTimeout: 'auto',
        action: `/twilio/book-appointment?callSid=${callSid}`,
        method: 'POST',
      })
      gather.say({ voice: 'Polly.Joanna-Neural' }, response.message || '')
    } else {
      twiml.say({ voice: 'Polly.Joanna-Neural' }, response.message || 'Thank you for calling. Have a great day!')
      twiml.hangup()
    }

    res.type('text/xml')
    res.send(twiml.toString())
  } catch (error) {
    console.error('Process speech error:', error)
    twiml.say({ voice: 'Polly.Joanna-Neural' }, 'I apologize for the inconvenience. Let me connect you with someone who can help.')
    twiml.hangup()
    res.type('text/xml')
    res.send(twiml.toString())
  }
})

// Voicemail done
twilioRoutes.post('/voicemail-done', async (req: Request, res: Response) => {
  const twiml = new VoiceResponse()
  twiml.say({ voice: 'Polly.Joanna-Neural' }, 'Thank you for your message. We will get back to you shortly. Goodbye!')
  twiml.hangup()
  res.type('text/xml')
  res.send(twiml.toString())
})

// Call status callback
twilioRoutes.post('/status', async (req: Request, res: Response) => {
  console.log('Call status:', req.body.CallStatus, req.body.CallSid)
  // TODO: update call log in DB
  res.sendStatus(200)
})

// Recording callback
twilioRoutes.post('/recording', async (req: Request, res: Response) => {
  console.log('Recording available:', req.body.RecordingUrl)
  // TODO: save recording URL to call log
  res.sendStatus(200)
})

// Transcription callback
twilioRoutes.post('/transcription', async (req: Request, res: Response) => {
  console.log('Transcription:', req.body.TranscriptionText)
  // TODO: save transcription to call log
  res.sendStatus(200)
})
