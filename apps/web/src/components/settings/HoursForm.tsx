'use client'

import { useState } from 'react'
import { SettingsForm } from './SettingsForm'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

type DayHours = { enabled: boolean; open: string; close: string }
type HoursMap = Record<string, DayHours>

const DEFAULT_DAY: DayHours = { enabled: true, open: '09:00', close: '17:00' }

export function HoursForm({ initial }: { initial: HoursMap | null }) {
  const [hours, setHours] = useState<HoursMap>(() => {
    const base: HoursMap = {}
    DAYS.forEach((d) => {
      base[d.key] = initial?.[d.key] || { ...DEFAULT_DAY, enabled: !['sat', 'sun'].includes(d.key) }
    })
    return base
  })

  function update(day: string, patch: Partial<DayHours>) {
    setHours((h) => ({ ...h, [day]: { ...h[day], ...patch } }))
  }

  return (
    <SettingsForm
      endpoint="/api/settings"
      title="Business Hours"
      description="Set when LEDO AI should answer calls. Outside these hours, callers go to voicemail."
      buildPayload={() => ({ businessHours: hours })}
    >
      <div className="space-y-3">
        {DAYS.map((d) => (
          <div key={d.key} className="flex items-center gap-4 py-2">
            <label className="flex items-center gap-2 w-32">
              <input
                type="checkbox"
                checked={hours[d.key].enabled}
                onChange={(e) => update(d.key, { enabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-ledo-600 focus:ring-ledo-500"
              />
              <span className="text-sm font-medium text-gray-900">{d.label}</span>
            </label>
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={hours[d.key].open}
                onChange={(e) => update(d.key, { open: e.target.value })}
                disabled={!hours[d.key].enabled}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-400">to</span>
              <input
                type="time"
                value={hours[d.key].close}
                onChange={(e) => update(d.key, { close: e.target.value })}
                disabled={!hours[d.key].enabled}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500 disabled:opacity-50"
              />
            </div>
          </div>
        ))}
      </div>
    </SettingsForm>
  )
}
