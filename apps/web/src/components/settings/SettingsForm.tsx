'use client'

import { useState, FormEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Props = {
  endpoint: string
  title: string
  description?: string
  children: ReactNode
  initialData?: Record<string, unknown>
  buildPayload?: (form: HTMLFormElement) => Record<string, unknown>
}

export function SettingsForm({ endpoint, title, description, children, initialData, buildPayload }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const formEl = e.currentTarget
    const formData = new FormData(formEl)
    let payload: Record<string, unknown>
    if (buildPayload) {
      payload = buildPayload(formEl)
    } else {
      payload = {}
      formData.forEach((v, k) => { payload[k] = v })
    }
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      setMessage({ type: 'success', text: 'Saved successfully' })
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Something went wrong' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Settings
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {children}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-ledo-600 text-white text-sm font-semibold rounded-lg hover:bg-ledo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
