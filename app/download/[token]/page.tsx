'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { iconicApi } from '@/lib/api'

interface DeliveryInfo {
  order_id: string
  email: string
  expires_at: string
  expired: boolean
  asset_count: number
  download_url: string
  bundle_type: string
  project_name: string | null
}

export default function DownloadPage() {
  const params = useParams()
  const token  = params.token as string

  const [info,    setInfo]    = useState<DeliveryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    iconicApi.getDelivery(token)
      .then(r => setInfo(r.data))
      .catch(e => {
        const msg = e?.response?.data?.detail ?? 'Could not load delivery info.'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-zinc-800/60 h-14 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
            <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <span className="text-sm font-bold">Iconic</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {error ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-1">Link not found</h1>
                <p className="text-sm text-zinc-500">{error}</p>
              </div>
              <Link href="/" className="inline-block text-sm text-amber-400 hover:text-amber-300 transition-colors">← Back to Iconic</Link>
            </div>
          ) : info ? (
            <div className="space-y-6">
              {info.expired ? (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white mb-1">Download Expired</h1>
                    <p className="text-sm text-zinc-500">This download link has expired. Sign in to re-package your assets.</p>
                  </div>
                  <Link href="/login" className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 transition-all"
                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                    Sign in
                  </Link>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-base font-bold text-white">Your assets are ready</h1>
                        {info.project_name && <p className="text-xs text-zinc-500">{info.project_name}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-800/60 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Assets</p>
                        <p className="text-lg font-bold text-white">{info.asset_count}</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Expires</p>
                        <p className="text-xs font-medium text-white mt-0.5">
                          {new Date(info.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`/api${info.download_url}`}
                      download
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-zinc-900 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download ZIP
                    </a>
                  </div>

                  <p className="text-center text-xs text-zinc-600">
                    Sent to {info.email} ·{' '}
                    <Link href="/signup" className="text-amber-600 hover:text-amber-500 transition-colors">
                      Create an account for longer link expiry
                    </Link>
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
