export interface CallLog {
  id: string
  callSid: string
  from: string
  to: string
  status: CallStatus
  duration: number
  recordingUrl?: string
  transcript?: string
  summary?: string
  intent?: CallIntent
  appointmentBooked?: boolean
  voicemailLeft?: boolean
  transferred?: boolean
  createdAt: Date
  updatedAt: Date
  organizationId: string
}

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'no-answer' | 'busy'

export type CallIntent = 'inquiry' | 'appointment' | 'complaint' | 'sales' | 'support' | 'voicemail' | 'transfer' | 'unknown'

export interface Organization {
  id: string
  name: string
  phoneNumber: string
  twilioPhoneNumber?: string
  businessHours: BusinessHours
  faqs: FAQ[]
  transferNumber?: string
  planId: string
  createdAt: Date
}

export interface BusinessHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

export interface DayHours {
  open: string  // "09:00"
  close: string // "18:00"
  closed: boolean
}

export interface FAQ {
  id: string
  question: string
  answer: string
  organizationId: string
}

export interface Appointment {
  id: string
  callerName: string
  callerPhone: string
  callerEmail?: string
  scheduledAt: Date
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  organizationId: string
  callLogId?: string
}

export interface User {
  id: string
  email: string
  name: string
  organizationId: string
  role: 'owner' | 'admin' | 'member'
}

export interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  notifyOnCall: boolean
  notifyOnVoicemail: boolean
  notifyOnAppointment: boolean
  recipientEmails: string[]
  recipientPhones: string[]
}
