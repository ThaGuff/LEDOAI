'use client'

import { useState } from 'react'
import { SettingsForm } from './SettingsForm'

type Initial = {
  emailEnabled: boolean
  smsEnabled: boolean
  notifyOnCall: boolean
  notifyOnVoicemail: boolean
  notifyOnAppointment: boolean
  recipientEmails: string[]
  recipientPhones: string[]
}

export function NotificationsForm({ initial }: { initial: Initial }) {
  const [state, setState] = useState(initial)
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')

  function toggle<K extends keyof Initial>(key: K, value: Initial[K]) {
    setState((s) => ({ ...s, [key]: value }))
  }

  function addEmail() {
    const v = emailInput.trim()
    if (!v || state.recipientEmails.includes(v)) return
    setState((s) => ({ ...s, recipientEmails: [...s.recipientEmails, v] }))
    setEmailInput('')
  }

  function removeEmail(e: string) {
    setState((s) => ({ ...s, recipientEmails: s.recipientEmails.filter((x) => x !== e) }))
  }

  function addPhone() {
    const v = phoneInput.trim()
    if (!v || state.recipientPhones.includes(v)) return
    setState((s) => ({ ...s, recipientPhones: [...s.recipientPhones, v] }))
    setPhoneInput('')
  }

  function removePhone(p: string) {
    setState((s) => ({ ...s, recipientPhones: s.recipientPhones.filter((x) => x !== p) }))
  }

  return (
    <SettingsForm
      endpoint="/api/settings/notifications"
      title="Notifications"
      description="Get email and SMS alerts when LEDO AI handles calls"
      buildPayload={() => ({ ...state })}
    >
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-900">Channels</p>
        <Toggle label="Email notifications" checked={state.emailEnabled} onChange={(v) => toggle('emailEnabled', v)} />
        <Toggle label="SMS notifications" checked={state.smsEnabled} onChange={(v) => toggle('smsEnabled', v)} />
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-sm font-medium text-gray-900">Notify me when</p>
        <Toggle label="A call is answered by LEDO AI" checked={state.notifyOnCall} onChange={(v) => toggle('notifyOnCall', v)} />
        <Toggle label="A voicemail is captured" checked={state.notifyOnVoicemail} onChange={(v) => toggle('notifyOnVoicemail', v)} />
        <Toggle label="An appointment is booked" checked={state.notifyOnAppointment} onChange={(v) => toggle('notifyOnAppointment', v)} />
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium text-gray-900 mb-2">Recipient emails</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail() } }}
            placeholder="alerts@yourbusiness.com"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
          />
          <button type="button" onClick={addEmail} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {state.recipientEmails.map((e) => (
            <span key={e} className="inline-flex items-center gap-1.5 px-3 py-1 bg-ledo-50 text-ledo-700 rounded-full text-xs">
              {e}
              <button type="button" onClick={() => removeEmail(e)} className="hover:text-ledo-900">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm font-medium text-gray-900 mb-2">Recipient phone numbers</p>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhone() } }}
            placeholder="+15551234567"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
          />
          <button type="button" onClick={addPhone} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {state.recipientPhones.map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1 bg-ledo-50 text-ledo-700 rounded-full text-xs">
              {p}
              <button type="button" onClick={() => removePhone(p)} className="hover:text-ledo-900">×</button>
            </span>
          ))}
        </div>
      </div>
    </SettingsForm>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-ledo-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  )
}
