'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the real error to the console + server logs so we can debug.
    console.error('Dashboard error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1">
            We hit an unexpected error loading this page.
          </p>
        </div>
        <details className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3">
          <summary className="cursor-pointer text-gray-600 font-medium">Technical details</summary>
          <p className="mt-2 text-gray-700 break-all whitespace-pre-wrap">
            {error?.message || 'Unknown error'}
          </p>
          {error?.digest && (
            <p className="mt-2 text-gray-500">Digest: {error.digest}</p>
          )}
        </details>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-ledo-600 text-white text-sm font-semibold rounded-lg hover:bg-ledo-700"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="flex-1 text-center px-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
