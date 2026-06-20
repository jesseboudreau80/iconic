'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'

interface PlanDef { label: string; price_usd: number; asset_limit: number | null; download_days: number; features: string[] }
interface BillingStatus { plan: string; usage: number; limit: number | null; resets_on: string; plans: Record<string, PlanDef> }

const PLAN_ORDER = ['pro', 'starter', 'lifetime', 'free'] as const
const MOST_POPULAR = new Set(['pro'])

const COLORS: Record<string, string> = {
  free: 'border-zinc-700', starter: 'border-blue-500/60', pro: 'border-amber-500/60', lifetime: 'border-purple-500/60',
}
const BADGES: Record<string, string> = {
  free: 'bg-zinc-800 text-zinc-400', starter: 'bg-blue-500/20 text-blue-300', pro: 'bg-amber-500/20 text-amber-300', lifetime: 'bg-purple-500/20 text-purple-300',
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [status,    setStatus]    = useState<BillingStatus | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const upgraded = searchParams.get('upgraded') === '1'

  useEffect(() => {
    iconicApi.getBillingStatus()
      .then(r => { setStatus(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleUpgrade(plan: string) {
    if (plan === 'free') return
    setUpgrading(plan); setError(null)
    try {
      const r = await iconicApi.createCheckout(plan)
      window.location.href = r.data.url
    } catch (e: unknown) {
      setError((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Could not start checkout.')
      setUpgrading(null)
    }
  }

  async function handlePortal() {
    setUpgrading('portal'); setError(null)
    try {
      const r = await iconicApi.createPortal()
      window.location.href = r.data.url
    } catch (e: unknown) {
      setError((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Could not open billing portal.')
      setUpgrading(null)
    }
  }

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    </AppShell>
  )

  if (!status) return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-zinc-500">Could not load billing status.</p>
      </div>
    </AppShell>
  )

  const { plan: currentPlan, usage, limit, resets_on, plans } = status
  const usagePct = limit ? Math.min(100, (usage / limit) * 100) : 0

  return (
    <AppShell>
      <div className="flex flex-col overflow-y-auto min-h-full">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white">Billing</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your Iconic plan and usage</p>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-8">

          {upgraded && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-emerald-300">Plan upgraded. Welcome to Iconic {plans[currentPlan]?.label}!</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Plans — most popular first */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Choose Your Plan</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLAN_ORDER.map(key => {
                const p          = plans[key]
                if (!p) return null
                const isCurrent  = key === currentPlan
                const isPopular  = MOST_POPULAR.has(key)
                const isLifetime = key === 'lifetime'
                const planIdx    = PLAN_ORDER.indexOf(key)
                const currIdx    = PLAN_ORDER.indexOf(currentPlan as typeof PLAN_ORDER[number])
                const canUpgrade = !isCurrent && planIdx < currIdx

                return (
                  <div key={key} className={`relative rounded-xl border p-4 flex flex-col gap-3 ${isPopular ? 'border-amber-500/60 bg-zinc-900 ring-1 ring-amber-500/20' : isCurrent ? COLORS[key] + ' bg-zinc-900' : 'border-zinc-800 bg-zinc-900/40'}`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-500 text-zinc-900 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">Most Popular</span>
                      </div>
                    )}
                    <div className={isPopular ? 'mt-1' : ''}>
                      <p className="text-sm font-semibold text-white">{p.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {p.price_usd === 0 ? 'Free' : `$${p.price_usd}`}
                        {p.price_usd > 0 && <span className="text-sm font-normal text-zinc-500">{isLifetime ? ' one-time' : '/mo'}</span>}
                      </p>
                    </div>
                    <ul className="flex flex-col gap-1.5 flex-1">
                      {p.features.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                          <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <div className="mt-auto pt-2">
                        <span className={`inline-block w-full text-center text-xs py-2 rounded-lg font-medium ${BADGES[key]}`}>Current Plan</span>
                      </div>
                    ) : canUpgrade ? (
                      <button onClick={() => handleUpgrade(key)} disabled={upgrading === key}
                        className={`mt-auto pt-2 w-full py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${isPopular ? 'bg-amber-500 hover:bg-amber-400 text-zinc-900' : isLifetime ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>
                        {upgrading === key ? 'Redirecting…' : isLifetime ? 'Get Lifetime Access' : `Upgrade to ${p.label}`}
                      </button>
                    ) : (
                      <div className="mt-auto pt-2">
                        <span className="inline-block w-full text-center text-xs py-2 rounded-lg text-zinc-600">Included</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current plan + usage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Your Current Plan</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-white">{plans[currentPlan]?.label ?? currentPlan}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGES[currentPlan] ?? 'bg-zinc-800 text-zinc-400'}`}>
                    {currentPlan === 'free' ? 'Free' : currentPlan === 'lifetime' ? 'Lifetime' : 'Active'}
                  </span>
                </div>
              </div>
              {currentPlan !== 'free' && (
                <button onClick={handlePortal} disabled={upgrading === 'portal'}
                  className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-50">
                  {upgrading === 'portal' ? 'Opening…' : 'Manage Subscription'}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Monthly Assets</span>
              <span className="text-xs text-zinc-400">{usage} / {limit === null ? '∞' : limit} · Resets {resets_on}</span>
            </div>
            {limit !== null && (
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${usagePct > 85 ? 'bg-red-400' : usagePct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${usagePct}%` }} />
              </div>
            )}
          </div>

          <p className="text-center text-xs text-zinc-600 pb-4">
            Monthly subscriptions cancel anytime. Lifetime is a one-time payment — no recurring charges ever.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

export default function BillingPage() {
  return <Suspense><BillingContent /></Suspense>
}
