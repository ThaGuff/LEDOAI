import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LEDO AI - Never Miss Another Call',
  description: 'AI-powered voice answering for businesses. LEDO AI answers every call, books appointments, and captures leads 24/7.',
  metadataBase: new URL('https://ledo.ai'),
  openGraph: {
    title: 'LEDO AI - Never Miss Another Call',
    description: 'AI-powered voice answering for businesses.',
    url: 'https://ledo.ai',
    siteName: 'LEDO AI',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
