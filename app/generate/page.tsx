'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'

interface Project  { id: string; name: string }
interface AssetType { id: string; label: string }
interface AssetRequest { id: string; project_id: string; asset_type: string; title: string; description: string; status: string; created_at: string; specification: object | null }
interface GeneratedAsset { id: string; status: string; image_url: string | null; storage_path: string | null; created_at: string }

const ICONS: Record<string, string> = {
  navigation_icon: '🧭', glyph: '✦', achievement_badge: '🏅', reward_token: '🪙', app_icon: '📱', ui_symbol: '◈',
}

const CHECKER: React.CSSProperties = {
  backgroundImage: 'linear-gradient(45deg,#2a2a2a 25%,transparent 25%),linear-gradient(-45deg,#2a2a2a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2a2a 75%),linear-gradient(-45deg,transparent 75%,#2a2a2a 75%)',
  backgroundSize: '20px 20px', backgroundPosition: '0 0,0 10px,10px -10px,-10px 0px',
}

const GEN_PHASES = [
  { icon: '🧬', label: 'Reading Brand DNA',       detail: 'Parsing visual identity, constraints, and palette' },
  { icon: '🏗️', label: 'Composing architecture',  detail: 'Structuring geometry, symmetry, and layout' },
  { icon: '💎', label: 'Applying materials',       detail: 'Mapping surface textures, finishes, and depth' },
  { icon: '💡', label: 'Setting up lighting',      detail: 'Placing sources, calculating specular highlights' },
  { icon: '🎨', label: 'Rendering colors',         detail: 'Applying primary, secondary, and accent palette' },
  { icon: '🖼️', label: 'Full resolution render',  detail: 'Generating 1024×1024 via Imagen 4' },
  { icon: '✨', label: 'Finishing touches',        detail: 'Polishing details and validating output' },
]

function GenerateContent() {
  const searchParams = useSearchParams()

  const [projects,   setProjects]   = useState<Project[]>([])
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
  const [history,    setHistory]    = useState<AssetRequest[]>([])
  const [selected,   setSelected]   = useState<AssetRequest | null>(null)
  const [asset,      setAsset]      = useState<GeneratedAsset | null>(null)

  const [step,    setStep]    = useState<1|2|3>(1)
  const [pid,     setPid]     = useState('')
  const [atype,   setAtype]   = useState('')
  const [title,   setTitle]   = useState('')
  const [desc,    setDesc]    = useState('')

  const [specifying,  setSpecifying]  = useState(false)
  const [generating,  setGenerating]  = useState(false)
  const [specError,   setSpecError]   = useState<string | null>(null)
  const [genError,    setGenError]    = useState<string | null>(null)
  const [loadError,   setLoadError]   = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [genPhase,    setGenPhase]    = useState(0)
  const [genElapsed,  setGenElapsed]  = useState(0)

  useEffect(() => {
    if (!generating) return
    setGenPhase(0)
    setGenElapsed(0)
    const phaseMs = 2800
    const phaseTimer = setInterval(() => {
      setGenPhase(p => Math.min(p + 1, GEN_PHASES.length - 1))
    }, phaseMs)
    const elapsedTimer = setInterval(() => {
      setGenElapsed(s => s + 1)
    }, 1000)
    return () => { clearInterval(phaseTimer); clearInterval(elapsedTimer) }
  }, [generating])

  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    const [pRes, tRes] = await Promise.allSettled([
      iconicApi.listProjects(),
      iconicApi.listAssetTypes(),
    ])
    if (pRes.status === 'fulfilled') {
      const list: Project[] = pRes.value.data
      setProjects(list)
      const preselect = searchParams.get('project')
      if (preselect && list.find(p => p.id === preselect)) {
        setPid(preselect); setStep(2)
      }
    } else {
      setLoadError(true)
    }
    if (tRes.status === 'fulfilled') setAssetTypes(tRes.value.data)
    setLoading(false)
  }, [searchParams])

  useEffect(() => { loadData() }, [loadData])

  const loadHistory = useCallback(async (id: string) => {
    if (!id) { setHistory([]); return }
    try { const r = await iconicApi.listRequests(id); setHistory(r.data) }
    catch { setHistory([]) }
  }, [])

  useEffect(() => { loadHistory(pid) }, [pid, loadHistory])

  useEffect(() => {
    if (!selected) { setAsset(null); return }
    iconicApi.listGenerations(selected.project_id, selected.id)
      .then(r => setAsset((r.data as GeneratedAsset[]).find(g => g.status === 'complete') ?? null))
      .catch(() => setAsset(null))
  }, [selected])

  async function createSpec() {
    if (!pid || !atype || !title.trim() || !desc.trim()) return
    setSpecifying(true); setSpecError(null)
    try {
      const r = await iconicApi.createRequest(pid, { asset_type: atype, title: title.trim(), description: desc.trim() })
      const req = r.data as AssetRequest
      setSelected(req); setAsset(null)
      setHistory(prev => [req, ...prev])
      setTitle(''); setDesc('')
    } catch (e: unknown) {
      setSpecError((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Specification failed.')
    } finally { setSpecifying(false) }
  }

  async function generate() {
    if (!selected) return
    setGenerating(true); setGenError(null)
    try {
      const r = await iconicApi.generateAsset(selected.project_id, selected.id)
      setAsset(r.data)
    } catch (e: unknown) {
      setGenError((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Generation failed.')
    } finally { setGenerating(false) }
  }

  const imgSrc = asset?.image_url ? `/api${asset.image_url}` : null

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">

        {/* Workflow panel */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800/60 flex flex-col lg:overflow-y-auto">
          <div className="px-5 pt-5 pb-4 border-b border-zinc-800/60">
            <h1 className="text-sm font-bold text-white">Asset Generator</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Brand DNA → Spec → Image</p>
          </div>

          <div className="flex-1 px-4 py-5 space-y-6">

            {/* Step 1: Project */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Step 1 — Project</p>
              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin flex-shrink-0" />
                  <span className="text-xs text-zinc-600">Loading…</span>
                </div>
              ) : loadError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 space-y-2">
                  <p className="text-xs text-red-400">Could not load projects. The API may be temporarily unavailable.</p>
                  <button onClick={loadData} className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">Retry →</button>
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 border-dashed px-3 py-3 text-center space-y-2">
                  <p className="text-xs text-zinc-600">No projects yet.</p>
                  <a href="/projects" className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">Create a project →</a>
                </div>
              ) : projects.map(p => (
                <button key={p.id} onClick={() => { setPid(p.id); setStep(2) }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${pid === p.id ? 'bg-amber-500/15 border border-amber-500/40 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}>
                  {p.name}
                </button>
              ))}
            </div>

            {/* Step 2: Asset type */}
            <div className={`space-y-2 transition-opacity ${step < 2 ? 'opacity-30 pointer-events-none' : ''}`}>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Step 2 — Asset Type</p>
              <div className="grid grid-cols-2 gap-1.5">
                {assetTypes.map(t => (
                  <button key={t.id} onClick={() => { setAtype(t.id); setStep(3) }}
                    className={`text-left px-3 py-2 rounded-xl text-xs transition-colors ${atype === t.id ? 'bg-amber-500/15 border border-amber-500/40 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700'}`}>
                    <span className="block text-base mb-0.5">{ICONS[t.id] || '◻'}</span>
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Describe */}
            <div className={`space-y-3 transition-opacity ${step < 3 ? 'opacity-30 pointer-events-none' : ''}`}>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Step 3 — Describe</p>
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short name"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-zinc-500 mb-1">Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Describe the visual concept…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 resize-none" />
              </div>
              {specError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{specError}</p>}
              <button onClick={createSpec} disabled={specifying || !title.trim() || !desc.trim()}
                className="w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 rounded-xl text-xs font-semibold text-white transition-colors">
                {specifying ? 'Building Specification…' : 'Build Specification'}
              </button>
            </div>

            {/* Step 4: Generate */}
            {selected && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Step 4 — Generate</p>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-zinc-500">Ready</p>
                  <p className="text-xs font-medium text-white truncate">{selected.title}</p>
                </div>
                {genError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{genError}</p>}
                <button onClick={generate} disabled={generating}
                  className="w-full py-2.5 rounded-xl text-xs font-bold disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  style={{ background: generating ? '#1c1917' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: generating ? '#f59e0b' : '#1c1917', border: generating ? '1px solid #92400e' : 'none' }}>
                  {generating ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-amber-700 border-t-amber-400 animate-spin flex-shrink-0" />
                      <span className="truncate">{GEN_PHASES[genPhase]?.label ?? 'Generating…'}</span>
                    </>
                  ) : asset ? 'Regenerate' : 'Generate Asset'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Output panel */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {!selected && !generating ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-4xl mb-3">⚡</div>
                <p className="text-sm font-medium text-zinc-400">Ready to generate</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs">Choose a project, pick an asset type, describe it, and generate.</p>
              </div>
            </div>
          ) : generating ? (
            /* ── Generation telemetry panel ── */
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-sm space-y-6">

                {/* Header */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Forging</span>
                  </div>
                  <p className="text-base font-bold text-white">{selected?.title ?? 'Asset'}</p>
                  <p className="text-xs text-zinc-500">{selected?.description}</p>
                </div>

                {/* Phase list */}
                <div className="space-y-1">
                  {GEN_PHASES.map((phase, i) => {
                    const done    = i < genPhase
                    const active  = i === genPhase
                    const pending = i > genPhase
                    return (
                      <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 ${active ? 'bg-zinc-800/70 border border-zinc-700' : 'border border-transparent'}`}>
                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
                          {done ? (
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : active ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium transition-colors ${done ? 'text-zinc-500 line-through decoration-zinc-700' : active ? 'text-white' : 'text-zinc-700'}`}>
                            {phase.icon} {phase.label}
                          </p>
                          {active && (
                            <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{phase.detail}</p>
                          )}
                        </div>
                        {done && <span className="text-[9px] text-emerald-600 flex-shrink-0 mt-1">done</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Progress bar + timer */}
                <div className="space-y-2">
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, ((genPhase + 0.5) / GEN_PHASES.length) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-zinc-600">{Math.round(((genPhase + 0.5) / GEN_PHASES.length) * 100)}% complete</p>
                    <p className="text-[10px] text-zinc-600 tabular-nums">{genElapsed}s elapsed</p>
                  </div>
                </div>

              </div>
            </div>
          ) : selected ? (
            <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-5 w-full">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{ICONS[selected.asset_type] || '◻'}</span>
                  <h2 className="text-base font-bold text-white">{selected.title}</h2>
                  {asset && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{asset.status}</span>}
                </div>
                <p className="text-xs text-zinc-500">{selected.description}</p>
              </div>

              {asset && (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-800" style={{ ...CHECKER }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt="Generated asset" className="relative z-10 w-full max-h-[400px] object-contain" />
                    ) : (
                      <div className="h-48 flex items-center justify-center">
                        <p className="text-xs text-zinc-600">Image unavailable</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {imgSrc && (
                      <a href={imgSrc} download={`iconic-${asset.id}.png`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-900 transition-all"
                        style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                        Download PNG
                      </a>
                    )}
                    <button onClick={generate} disabled={generating}
                      className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-300 transition-colors">
                      Regenerate
                    </button>
                  </div>
                </div>
              )}

              {!asset && selected.specification && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs text-amber-400">Specification ready. Click "Generate Asset" to create the image.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* History sidebar (desktop only) */}
        {history.length > 0 && (
          <div className="hidden lg:flex w-52 flex-shrink-0 border-l border-zinc-800/60 flex-col overflow-hidden">
            <div className="px-4 pt-5 pb-3 border-b border-zinc-800/60">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">History</p>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
              {history.map(req => (
                <button key={req.id} onClick={() => { setSelected(req); setAsset(null) }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${selected?.id === req.id ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{ICONS[req.asset_type] || '◻'}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{req.title}</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default function GeneratePage() {
  return <Suspense><GenerateContent /></Suspense>
}
