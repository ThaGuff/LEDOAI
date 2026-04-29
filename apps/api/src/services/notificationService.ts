import sgMail from '@sendgrid/mail'
import twilio from 'twilio'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export interface NotificationPayload {
  type: 'call_received' | 'voicemail' | 'appointment_booked' | 'call_summary'
  recipientEmails: string[]
  recipientPhones: string[]
  data: {
    callerNumber?: string
    callDuration?: number
    summary?: string
    transcript?: string
    appointmentName?: string
    appointmentTime?: string
    recordingUrl?: string
    businessName?: string
  }
}

export async function sendNotification(payload: NotificationPayload) {
  const { type, recipientEmails, recipientPhones, data } = payload

  const templates: Record<string, { subject: string; text: string }> = {
    call_received: {
      subject: `📞 New Call from ${data.callerNumber || 'Unknown'}`,
      text: `LEDO AI answered a call from ${data.callerNumber}.\n\nSummary: ${data.summary || 'No summary available'}\n\nCall duration: ${data.callDuration || 0}s`,
    },
    voicemail: {
      subject: `🎙 New Voicemail from ${data.callerNumber || 'Unknown'}`,
      text: `You have a new voicemail from ${data.callerNumber}.\n\nTranscript: ${data.transcript || 'No transcript'}\n\nListen: ${data.recordingUrl || 'N/A'}`,
    },
    appointment_booked: {
      subject: `📅 New Appointment: ${data.appointmentName || 'Unknown'}`,
      text: `LEDO AI booked an appointment!\n\nName: ${data.appointmentName}\nTime: ${data.appointmentTime || 'TBD'}\nCaller: ${data.callerNumber}`,
    },
    call_summary: {
      subject: `📋 Call Summary — ${data.callerNumber}`,
      text: `Call Summary\n\nFrom: ${data.callerNumber}\nDuration: ${data.callDuration}s\n\nSummary:\n${data.summary}\n\nTranscript:\n${data.transcript}`,
    },
  }

  const template = templates[type]
  if (!template) return

  // Send emails
  const emailPromises = recipientEmails
    .filter(Boolean)
    .map(async (email) => {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || 'hello@ledo.ai',
          subject: template.subject,
          text: template.text,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px">
              <span style="font-weight:700;font-size:18px;color:#1e1b4b">LEDO AI</span>
            </div>
            <h2 style="color:#111827;margin:0 0 12px">${template.subject}</h2>
            <p style="color:#6b7280;white-space:pre-line">${template.text}</p>
            <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0"/>
            <p style="color:#9ca3af;font-size:12px">LEDO AI · ledo.ai · Unsubscribe</p>
          </div>`,
        })
      } catch (err) {
        console.error(`Email to ${email} failed:`, err)
      }
    })

  // Send SMS
  const smsPromises = recipientPhones
    .filter(Boolean)
    .map(async (phone) => {
      try {
        await twilioClient.messages.create({
          body: `${template.subject}\n\n${template.text.slice(0, 140)}`,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: phone,
        })
      } catch (err) {
        console.error(`SMS to ${phone} failed:`, err)
      }
    })

  await Promise.allSettled([...emailPromises, ...smsPromises])
}
