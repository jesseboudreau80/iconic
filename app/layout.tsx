import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Iconic — AI Design System for Founders',
  description: 'Generate brand-consistent icon sets, badges, and UI assets powered by your Brand DNA.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
        {/* Iris — AI concierge + booking widget */}
        <Script
          src="https://iris.jesseboudreau.com/iris.js?v=20260701b"
          data-key="iris_live_9c8bb78e6d0ecb8e5aac98783160ef7a"
          data-api="https://aegis-api.jesseboudreau.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
