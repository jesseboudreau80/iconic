'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'
import { getUser } from '@/lib/auth'

interface Project { id: string; name: string; slug: string; description: string | null; brand_dna: object | null }
interface BillingStatus { plan: string; usage: number; limit: number | null; resets_on: string }

const PLAN_BADGE: Record<string, string> = {
  free:     'bg-zinc-800 text-zinc-400',
  starter:  'bg-blue-500/20 text-blue-300',
  pro:      'bg-amber-500/20 text-amber-300',
  lifetime: 'bg-purple-500/20 text-purple-300',
}

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [billing,  setBilling]  = useState<BillingStatus | null>(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.allSettled([
      iconicApi.listProjects(),
      iconicApi.getBillingStatus(),
    ]).then(([pRes, bRes]) => {
      if (pRes.status === 'fulfilled') setProjects(pRes.value.data)
      if (bRes.status === 'fulfilled') setBilling(bRes.value.data)
      setLoading(false)
    })
  }, [])

  const usagePct = billing?.limit ? Math.min(100, ((billing.usage ?? 0) / billing.limit) * 100) : 0

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your brand design system at a glance.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Projects */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Projects</p>
            <p className="text-3xl font-bold text-white">{loading ? '—' : projects.length}</p>
            <p className="text-xs text-zinc-600 mt-1">{projects.filter(p => p.brand_dna).length} with Brand DNA</p>
          </div>

          {/* Plan */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Plan</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-3xl font-bold text-white capitalize">{billing?.plan ?? '—'}</p>
              {billing?.plan && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PLAN_BADGE[billing.plan] ?? 'bg-zinc-800 text-zinc-400'}`}>
                  {billing.plan === 'free' ? 'Free' : billing.plan === 'lifetime' ? 'Lifetime' : 'Active'}
                </span>
              )}
            </div>
            <Link href="/billing" className="text-xs text-amber-500 hover:text-amber-400 transition-colors mt-1 block">
              {billing?.plan === 'free' ? 'Upgrade →' : 'Manage →'}
            </Link>
          </div>

          {/* Usage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Assets this month</p>
            <p className="text-3xl font-bold text-white">
              {billing ? billing.usage : '—'}
              <span className="text-sm font-normal text-zinc-500">
                {' '}/ {billing?.limit === null ? '∞' : (billing?.limit ?? '—')}
              </span>
            </p>
            {billing?.limit !== null && billing?.limit !== undefined && (
              <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usagePct > 85 ? 'bg-red-400' : usagePct > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/projects"
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 p-5 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Projects</p>
            </div>
            <p className="text-xs text-zinc-500">Manage your brand projects and define their DNA.</p>
          </Link>

          <Link
            href="/generate"
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 p-5 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Generate</p>
            </div>
            <p className="text-xs text-zinc-500">Create new brand assets from your Brand DNA.</p>
          </Link>
        </div>

        {/* Recent projects */}
        {!loading && projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Projects</h2>
              <Link href="/projects" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">View all →</Link>
            </div>
            <div className="space-y-2">
              {projects.slice(0, 4).map(p => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 px-4 py-3 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    {p.description && <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xs">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.brand_dna ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">DNA set</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">No DNA</span>
                    )}
                    <svg className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="rounded-xl border border-zinc-800 border-dashed p-12 text-center">
            <p className="text-sm text-zinc-500 mb-4">No projects yet.</p>
            <Link
              href="/projects"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 transition-all"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              Create your first project
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}
