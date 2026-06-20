'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'

interface Project { id: string; name: string; slug: string; description: string | null; brand_dna: object | null }

export default function ProjectsPage() {
  const router = useRouter()
  const [projects,   setProjects]   = useState<Project[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name,       setName]       = useState('')
  const [desc,       setDesc]       = useState('')
  const [creating,   setCreating]   = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    iconicApi.listProjects()
      .then(r => setProjects(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function createProject() {
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const r = await iconicApi.createProject({ name: name.trim(), description: desc.trim() || undefined })
      setProjects(prev => [r.data, ...prev])
      setShowCreate(false)
      setName('')
      setDesc('')
      router.push(`/projects/${r.data.id}`)
    } catch (e: unknown) {
      setError((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to create project.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white">Projects</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Each project has its own Brand DNA and asset library.</p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setError(null) }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 flex-shrink-0 transition-all"
            style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
          >
            New Project
          </button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 w-full max-w-sm flex flex-col gap-4">
              <h2 className="text-base font-semibold text-white">New Project</h2>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project name</label>
                <input
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createProject()}
                  placeholder="e.g. BarkMind"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description <span className="text-zinc-600">(optional)</span></label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief description of this brand"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={createProject}
                  disabled={creating || !name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
                >
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
                <button
                  onClick={() => { setShowCreate(false); setName(''); setDesc(''); setError(null) }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project list */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mx-auto" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 border-dashed p-14 text-center">
            <p className="text-sm text-zinc-500 mb-4">No projects yet. Create one to get started.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-900 transition-all"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(p => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900 p-5 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    {p.description && <p className="text-xs text-zinc-500 mt-0.5 truncate">{p.description}</p>}
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center gap-2">
                  {p.brand_dna ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                      Brand DNA set
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                      Setup Brand DNA
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
