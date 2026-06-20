'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'

interface BrandDNA {
  id: string; version: number
  industry: string | null; theme: string | null; style: string | null
  shape_language: string | null; complexity_level: string | null
  primary_color: string | null; secondary_color: string | null; accent_color: string | null
  material_style: string | null; lighting_style: string | null
  symmetry_rule: string | null; silhouette_rule: string | null; background_rule: string | null
  navigation_icon_size: string | null; glyph_size: string | null; badge_size: string | null; app_icon_size: string | null
  transparent_background: boolean; no_text: boolean; no_labels: boolean; no_numbers: boolean; small_size_optimized: boolean
}
interface Project { id: string; name: string; description: string | null; brand_dna: BrandDNA | null }
interface Template { id: string; name: string; description: string; dna: Partial<BrandDNA> }

function empty() {
  return {
    industry: '', theme: '', style: '', shape_language: '', complexity_level: '',
    primary_color: '#2563EB', secondary_color: '#1E293B', accent_color: '#60A5FA',
    material_style: '', lighting_style: '', symmetry_rule: '', silhouette_rule: '', background_rule: '',
    navigation_icon_size: '24x24', glyph_size: '16x16', badge_size: '48x48', app_icon_size: '1024x1024',
    transparent_background: true, no_text: true, no_labels: true, no_numbers: true, small_size_optimized: true,
  }
}

function fromDNA(d: BrandDNA) {
  return {
    industry: d.industry ?? '', theme: d.theme ?? '', style: d.style ?? '',
    shape_language: d.shape_language ?? '', complexity_level: d.complexity_level ?? '',
    primary_color: d.primary_color ?? '#2563EB', secondary_color: d.secondary_color ?? '#1E293B', accent_color: d.accent_color ?? '#60A5FA',
    material_style: d.material_style ?? '', lighting_style: d.lighting_style ?? '',
    symmetry_rule: d.symmetry_rule ?? '', silhouette_rule: d.silhouette_rule ?? '', background_rule: d.background_rule ?? '',
    navigation_icon_size: d.navigation_icon_size ?? '24x24', glyph_size: d.glyph_size ?? '16x16',
    badge_size: d.badge_size ?? '48x48', app_icon_size: d.app_icon_size ?? '1024x1024',
    transparent_background: d.transparent_background, no_text: d.no_text, no_labels: d.no_labels,
    no_numbers: d.no_numbers, small_size_optimized: d.small_size_optimized,
  }
}

function toPayload(f: ReturnType<typeof empty>) {
  return {
    industry: f.industry || null, theme: f.theme || null, style: f.style || null,
    shape_language: f.shape_language || null, complexity_level: f.complexity_level || null,
    primary_color: f.primary_color || null, secondary_color: f.secondary_color || null, accent_color: f.accent_color || null,
    material_style: f.material_style || null, lighting_style: f.lighting_style || null,
    symmetry_rule: f.symmetry_rule || null, silhouette_rule: f.silhouette_rule || null, background_rule: f.background_rule || null,
    navigation_icon_size: f.navigation_icon_size || null, glyph_size: f.glyph_size || null,
    badge_size: f.badge_size || null, app_icon_size: f.app_icon_size || null,
    transparent_background: f.transparent_background, no_text: f.no_text, no_labels: f.no_labels,
    no_numbers: f.no_numbers, small_size_optimized: f.small_size_optimized,
  }
}

function Field({ label, value, onChange, placeholder, area }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; area?: boolean }) {
  const cls = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 transition-colors"
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      {area ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2} className={`${cls} resize-none`} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer p-0.5" />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="#2563EB" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 font-mono" />
      </div>
    </div>
  )
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-9 h-5 rounded-full border border-zinc-600 bg-zinc-800 peer-checked:bg-amber-500 peer-checked:border-amber-400 transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-zinc-400 peer-checked:bg-white peer-checked:translate-x-4 transition-all" />
      </div>
      <div>
        <p className="text-sm text-zinc-300">{label}</p>
        {desc && <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>}
      </div>
    </label>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800/60">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

export default function ProjectPage() {
  const params    = useParams()
  const router    = useRouter()
  const projectId = params.id as string

  const [project,   setProject]   = useState<Project | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [form,      setForm]      = useState(empty())
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [tab,       setTab]       = useState<'editor' | 'generate'>('editor')

  const hasDNA = Boolean(project?.brand_dna)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, tRes] = await Promise.allSettled([
        iconicApi.getProject(projectId),
        iconicApi.listTemplates(),
      ])
      if (pRes.status === 'fulfilled') {
        const p = pRes.value.data as Project
        setProject(p)
        if (p.brand_dna) setForm(fromDNA(p.brand_dna))
      } else {
        router.replace('/projects')
      }
      if (tRes.status === 'fulfilled') setTemplates(tRes.value.data)
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  useEffect(() => { load() }, [load])

  function applyTemplate(t: Template) {
    const d = t.dna
    setForm(prev => ({
      ...prev,
      industry: (d.industry as string) || prev.industry,
      theme: (d.theme as string) || prev.theme,
      style: (d.style as string) || prev.style,
      shape_language: (d.shape_language as string) || prev.shape_language,
      complexity_level: (d.complexity_level as string) || prev.complexity_level,
      primary_color: (d.primary_color as string) || prev.primary_color,
      secondary_color: (d.secondary_color as string) || prev.secondary_color,
      accent_color: (d.accent_color as string) || prev.accent_color,
      material_style: (d.material_style as string) || prev.material_style,
      lighting_style: (d.lighting_style as string) || prev.lighting_style,
      symmetry_rule: (d.symmetry_rule as string) || prev.symmetry_rule,
      silhouette_rule: (d.silhouette_rule as string) || prev.silhouette_rule,
      background_rule: (d.background_rule as string) || prev.background_rule,
    }))
  }

  async function save() {
    setSaving(true); setError(null)
    try {
      if (hasDNA) await iconicApi.updateDNA(projectId, toPayload(form))
      else        await iconicApi.createDNA(projectId, toPayload(form))
      await load()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch { setError('Failed to save. Please try again.') }
    finally { setSaving(false) }
  }

  function set(field: keyof typeof form) {
    return (value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (!project) return null

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center gap-3 flex-wrap">
          <button onClick={() => router.push('/projects')} className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{project.name}</p>
            {project.description && <p className="text-[11px] text-zinc-500">{project.description}</p>}
          </div>
          {hasDNA && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/40 text-emerald-400">
              v{project.brand_dna?.version} · Active
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-800 px-4 flex">
          {(['editor', 'generate'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-amber-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              {t === 'editor' ? 'Brand DNA Editor' : 'Generate Assets'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'editor' && (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

              {!hasDNA && templates.length > 0 && (
                <div className="bg-zinc-900/60 border border-zinc-800 border-dashed rounded-2xl px-5 py-4">
                  <p className="text-xs font-medium text-zinc-400 mb-3">Start from a template</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => applyTemplate(t)}
                        className="text-left px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-xl transition-colors">
                        <p className="text-xs font-medium text-white truncate">{t.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{t.description?.split('.')[0]}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Card title="1 · Brand Identity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Industry" value={form.industry} onChange={set('industry') as (v: string) => void} placeholder="e.g. Pet Care, Gaming, SaaS" />
                  <Field label="Theme" value={form.theme} onChange={set('theme') as (v: string) => void} placeholder="e.g. Warmth / Trust / Joy" />
                </div>
              </Card>

              <Card title="2 · Colors">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ColorField label="Primary"   value={form.primary_color}   onChange={set('primary_color')   as (v: string) => void} />
                  <ColorField label="Secondary" value={form.secondary_color} onChange={set('secondary_color') as (v: string) => void} />
                  <ColorField label="Accent"    value={form.accent_color}    onChange={set('accent_color')    as (v: string) => void} />
                </div>
              </Card>

              <Card title="3 · Style">
                <Field label="Visual Style" value={form.style} onChange={set('style') as (v: string) => void} placeholder="e.g. Flat design with subtle depth shadows" area />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Shape Language" value={form.shape_language} onChange={set('shape_language') as (v: string) => void} placeholder="e.g. Rounded rectangles, soft corners" />
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Complexity</label>
                    <select value={form.complexity_level} onChange={e => set('complexity_level')(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/60">
                      <option value="">Select…</option>
                      <option value="low">Low — minimal, single-weight</option>
                      <option value="medium">Medium — moderate detail</option>
                      <option value="high">High — rich, ornate</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card title="4 · Materials & Lighting">
                <Field label="Material Style" value={form.material_style} onChange={set('material_style') as (v: string) => void} placeholder="e.g. Flat matte with 1dp elevation shadow" area />
                <Field label="Lighting Style" value={form.lighting_style} onChange={set('lighting_style') as (v: string) => void} placeholder="e.g. Soft flat uniform — no harsh directional shadows" area />
              </Card>

              <Card title="5 · Composition Rules">
                <Field label="Symmetry Rule"   value={form.symmetry_rule}   onChange={set('symmetry_rule')   as (v: string) => void} placeholder="e.g. Bilateral symmetry required" area />
                <Field label="Silhouette Rule" value={form.silhouette_rule} onChange={set('silhouette_rule') as (v: string) => void} placeholder="e.g. Crisp geometric silhouette at 16×16" area />
                <Field label="Background Rule" value={form.background_rule} onChange={set('background_rule') as (v: string) => void} placeholder="e.g. Transparent always for navigation icons" area />
              </Card>

              <Card title="6 · Size Constraints">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field label="Nav Icon" value={form.navigation_icon_size} onChange={set('navigation_icon_size') as (v: string) => void} placeholder="24x24" />
                  <Field label="Glyph"    value={form.glyph_size}           onChange={set('glyph_size')           as (v: string) => void} placeholder="16x16" />
                  <Field label="Badge"    value={form.badge_size}           onChange={set('badge_size')           as (v: string) => void} placeholder="48x48" />
                  <Field label="App Icon" value={form.app_icon_size}        onChange={set('app_icon_size')        as (v: string) => void} placeholder="1024x1024" />
                </div>
              </Card>

              <Card title="7 · Generation Rules">
                <div className="space-y-3">
                  <Toggle label="Transparent Background" desc="Always transparent for layering" checked={form.transparent_background} onChange={set('transparent_background') as (v: boolean) => void} />
                  <Toggle label="No Text"    desc="Never embed text characters"    checked={form.no_text}    onChange={set('no_text')    as (v: boolean) => void} />
                  <Toggle label="No Labels"  desc="No label overlays"              checked={form.no_labels}  onChange={set('no_labels')  as (v: boolean) => void} />
                  <Toggle label="No Numbers" desc="No numeric characters"          checked={form.no_numbers} onChange={set('no_numbers') as (v: boolean) => void} />
                  <Toggle label="Small Size Optimized" desc="Optimize for small display sizes" checked={form.small_size_optimized} onChange={set('small_size_optimized') as (v: boolean) => void} />
                </div>
              </Card>

              {/* Save bar */}
              <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {error  && <p className="text-xs text-red-400">{error}</p>}
                  {saved  && <p className="text-xs text-emerald-400">Saved — governance checkpoint created.</p>}
                  {!error && !saved && <p className="text-[10px] text-zinc-600">{hasDNA ? `Saving creates v${(project.brand_dna?.version ?? 0) + 1} checkpoint.` : 'First save creates Brand DNA v1.'}</p>}
                </div>
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 disabled:opacity-50 flex-shrink-0 transition-all"
                  style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                  {saving ? <><div className="w-3.5 h-3.5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />Saving…</> : hasDNA ? 'Save Brand DNA' : 'Create Brand DNA'}
                </button>
              </div>
            </div>
          )}

          {tab === 'generate' && (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center">
              {hasDNA ? (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-400">Brand DNA is set. Go to the Generator to create assets for this project.</p>
                  <a href={`/generate?project=${projectId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 transition-all"
                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
                    Open Generator →
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500">Set up your Brand DNA first before generating assets.</p>
                  <button onClick={() => setTab('editor')} className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    Go to Brand DNA Editor →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
