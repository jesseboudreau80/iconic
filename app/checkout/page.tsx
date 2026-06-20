'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'

interface Project { id: string; name: string }
interface Asset { id: string; status: string; image_url: string | null }
interface Request { id: string; asset_type: string; title: string; _asset?: Asset | null }
interface Bundle { id: string; label: string; description: string }

const TYPE_LABELS: Record<string, string> = {
  navigation_icon: 'Nav Icon', glyph: 'Glyph', achievement_badge: 'Badge',
  reward_token: 'Token', app_icon: 'App Icon', ui_symbol: 'Symbol',
}
const CHECKER: React.CSSProperties = {
  backgroundImage: 'linear-gradient(45deg,#1f1f1f 25%,transparent 25%),linear-gradient(-45deg,#1f1f1f 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1f1f1f 75%),linear-gradient(-45deg,transparent 75%,#1f1f1f 75%)',
  backgroundSize: '12px 12px', backgroundPosition: '0 0,0 6px,6px -6px,-6px 0px', backgroundColor: '#2a2a2a',
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects,   setProjects]   = useState<Project[]>([])
  const [pid,        setPid]        = useState('')
  const [requests,   setRequests]   = useState<Request[]>([])
  const [selected,   setSelected]   = useState<Set<string>>(new Set())
  const [bundles,    setBundles]    = useState<Bundle[]>([])
  const [bundleType, setBundleType] = useState('custom_pack')
  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [step,       setStep]       = useState<'select'|'processing'|'done'>('select')
  const [token,      setToken]      = useState<string | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    iconicApi.listProjects().then(r => {
      const list: Project[] = r.data
      setProjects(list)
      const pre = searchParams.get('project')
      if (pre && list.find(p => p.id === pre)) setPid(pre)
      else if (list.length === 1) setPid(list[0].id)
    }).catch(console.error)
    iconicApi.listBundles().then(r => setBundles(r.data)).catch(console.error)
  }, [searchParams])

  const loadAssets = useCallback(async (id: string) => {
    if (!id) return
    setLoading(true); setRequests([]); setSelected(new Set())
    try {
      const r = await iconicApi.listRequests(id)
      const reqs: Request[] = r.data
      const enriched = await Promise.all(reqs.map(async req => {
        try {
          const gr = await iconicApi.listGenerations(id, req.id)
          return { ...req, _asset: (gr.data as Asset[]).find(a => a.status === 'complete') ?? null }
        } catch { return { ...req, _asset: null } }
      }))
      setRequests(enriched.filter(r => r._asset))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (pid) loadAssets(pid) }, [pid, loadAssets])

  async function handleCheckout() {
    if (!email.trim()) { setError('Email is required'); return }
    if (selected.size === 0) { setError('Select at least one asset'); return }
    setError(null); setStep('processing')
    try {
      const o = await iconicApi.createOrder({ email: email.trim(), project_id: pid, bundle_type: bundleType, asset_request_ids: Array.from(selected) })
      const p = await iconicApi.packageOrder(o.data.id)
      setToken(p.data.download_token); setStep('done')
    } catch (e: unknown) {
      setError((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Checkout failed.')
      setStep('select')
    }
  }

  if (step === 'done' && token) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Package Ready</h2>
            <p className="text-sm text-zinc-400">Your assets have been bundled.</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => router.push(`/download/${token}`)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-zinc-900 transition-all"
              style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
              Go to Download
            </button>
            <button onClick={() => { setStep('select'); setToken(null); setSelected(new Set()) }}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors">
              Create Another
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white">Checkout</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Package your generated assets for download</p>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
          {/* Left — asset selection */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800">
            <div className="mb-5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Project</label>
              <select value={pid} onChange={e => setPid(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm focus:outline-none focus:border-amber-500/60">
                <option value="">Select a project…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {pid && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Generated Assets {requests.length > 0 && `(${requests.length})`}</span>
                  {requests.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(new Set(requests.map(r => r.id)))} className="text-xs text-zinc-400 hover:text-white">All</button>
                      <span className="text-zinc-700">·</span>
                      <button onClick={() => setSelected(new Set())} className="text-xs text-zinc-400 hover:text-white">None</button>
                    </div>
                  )}
                </div>
                {loading ? (
                  <div className="flex justify-center py-8"><div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" /></div>
                ) : requests.length === 0 ? (
                  <p className="text-sm text-zinc-600 py-8 text-center">No generated assets yet. Go to Generate to create some.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {requests.map(req => {
                      const sel = selected.has(req.id)
                      const src = req._asset?.image_url ? `/api${req._asset.image_url}` : null
                      return (
                        <button key={req.id} onClick={() => setSelected(prev => { const n = new Set(prev); if (n.has(req.id)) n.delete(req.id); else n.add(req.id); return n })}
                          className={`relative rounded-xl border text-left transition-all ${sel ? 'border-amber-500/70 bg-amber-500/5 ring-1 ring-amber-500/30' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}>
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${sel ? 'border-amber-400 bg-amber-400' : 'border-zinc-600'}`}>
                            {sel && <svg className="w-3 h-3 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div className="rounded-t-xl overflow-hidden" style={{ ...CHECKER, height: 90 }}>
                            {src && <img src={src} alt={req.title} className="w-full h-full object-contain p-2" />}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-medium text-white truncate">{req.title}</p>
                            <p className="text-[10px] text-zinc-500">{TYPE_LABELS[req.asset_type] ?? req.asset_type}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right — order summary */}
          <div className="w-full lg:w-72 lg:flex-shrink-0 p-4 sm:p-5 flex flex-col gap-5">
            {bundles.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Bundle Type</label>
                <div className="flex flex-col gap-2">
                  {bundles.map(b => (
                    <button key={b.id} onClick={() => setBundleType(b.id)}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-all ${bundleType === b.id ? 'border-amber-500/60 bg-amber-500/5 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'}`}>
                      <p className="text-sm font-medium">{b.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{b.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-3">
              <p className="text-xs text-zinc-500 mb-1">Selected</p>
              <p className="text-2xl font-bold text-white">{selected.size} <span className="text-sm font-normal text-zinc-500">asset{selected.size !== 1 ? 's' : ''}</span></p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/60" />
              <p className="text-xs text-zinc-600 mt-1.5">No account required for download</p>
            </div>

            <div className="rounded-lg border border-zinc-800 px-3 py-3 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="text-sm font-semibold text-emerald-400">Free</span>
            </div>

            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5"><p className="text-xs text-red-400">{error}</p></div>}

            <button onClick={handleCheckout} disabled={step === 'processing' || selected.size === 0 || !email.trim() || !pid}
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              {step === 'processing' ? 'Packaging…' : 'Package & Download'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>
}
