import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seattle 2026 — Your World Cup Concierge',
  description:
    'Personalized World Cup fan guide for Seattle 2026. Find tickets, food, transport, and more — tailored to you.',
  openGraph: {
    title: 'Seattle 2026 — Your World Cup Concierge',
    description: 'Personalized fan guide for the 2026 FIFA World Cup in Seattle.',
    siteName: 'Seattle 2026',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
