'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f9fafb' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>
              Something went wrong
            </h2>
            <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
              The page failed to load. Please try again.
            </p>
            <details style={{
              marginTop: '12px',
              fontSize: '12px',
              background: '#f9fafb',
              border: '1px solid #f3f4f6',
              borderRadius: '8px',
              padding: '12px',
            }}>
              <summary style={{ cursor: 'pointer', color: '#4b5563', fontWeight: 500 }}>
                Technical details
              </summary>
              <p style={{ marginTop: '8px', color: '#374151', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                {error?.message || 'Unknown error'}
              </p>
              {error?.digest && (
                <p style={{ marginTop: '8px', color: '#6b7280' }}>Digest: {error.digest}</p>
              )}
            </details>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px 16px',
                background: '#0284c7',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
