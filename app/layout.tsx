import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Iconic — AI Design System for Founders',
  description: 'Generate brand-consistent icon sets, badges, and UI assets powered by your Brand DNA.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">{children}</body>
    </html>
  )
}
