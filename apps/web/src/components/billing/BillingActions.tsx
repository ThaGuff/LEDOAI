'use client'

import { useState } from 'react'

type Props = {
  plan: 'starter' | 'pro' | 'business'
  isCurrent: boolean
  popular?: boolean
}

export function UpgradeButton({ plan, isCurrent, popular }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (isCurrent) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error || 'Could not start checkout')
        setLoading(false)
        return
      }
      window.location.href = json.url
    } catch (e) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isCurrent || loading}
        className={`w-full mt-6 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          isCurrent
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : popular
              ? 'bg-ledo-600 text-white hover:bg-ledo-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrent ? 'Current plan' : loading ? 'Redirecting…' : 'Upgrade'}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </>
  )
}

export function ManageSubscriptionButton({ hasSubscription }: { hasSubscription: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  if (!hasSubscription) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50"
    >
      {loading ? 'Opening…' : 'Manage subscription'}
    </button>
  )
}
