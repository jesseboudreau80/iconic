'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import { iconicApi } from '@/lib/api'

interface LibraryAsset {
  request_id: string
  title: string
  description: string
  asset_type: string
  status: string
  color_overrides: { primary_color?: string; secondary_color?: string; accent_color?: string } | null
  context_note: string | null
  created_at: string
  image_url: string | null
  generation_id: string | null
  generation_created_at: string | null
  provider: string | null
}

interface LibraryGroup {
  asset_type: string
  label: string
  assets: LibraryAsset[]
}

const TYPE_ICONS: Record<string, string> = {
  app_icon:        '📱',
  navigation_icon: '🧭',
  glyph:           '✦',
  achievement_badge: '🏆',
  reward_token:    '🪙',
  ui_symbol:       '⬡',
}

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
      style={{ background: color }}
    />
  )
}

function AssetCard({ asset, projectId }: { asset: LibraryAsset; projectId: string }) {
  const [downloading, setDownloading] = useState(false)
  const imageBase = typeof window !== 'undefined' ? window.location.origin : ''

  const handleDownload = async () => {
    if (!asset.image_url) return
    setDownloading(true)
    try {
      const res = await fetch(`/api${asset.image_url}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${asset.title.replace(/\s+/g, '_')}.png`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const hasOverride = asset.color_overrides && Object.values(asset.color_overrides).some(Boolean)

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden flex flex-col">
      {/* Image area */}
      <div className="relative bg-zinc-800 aspect-square flex items-center justify-center">
        {asset.image_url ? (
          <img
            src={`/api${asset.image_url}`}
            alt={asset.title}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            <span className="text-3xl">{TYPE_ICONS[asset.asset_type] ?? '🖼️'}</span>
            <span className="text-xs">Not generated</span>
          </div>
        )}
        {hasOverride && (
          <div className="absolute top-2 right-2 flex gap-0.5">
            {asset.color_overrides?.primary_color && <Swatch color={asset.color_overrides.primary_color} />}
            {asset.color_overrides?.secondary_color && <Swatch color={asset.color_overrides.secondary_color} />}
            {asset.color_overrides?.accent_color && <Swatch color={asset.color_overrides.accent_color} />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-white text-sm font-medium leading-tight truncate">{asset.title}</p>
          {asset.description && asset.description !== asset.title && (
            <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{asset.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-auto">
          {asset.provider && (
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              {asset.provider}
            </span>
          )}
          {hasOverride && (
            <span className="text-xs text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full">
              custom colors
            </span>
          )}
        </div>

        {asset.image_url && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full mt-1 py-2 rounded-lg bg-[#F5A623] text-black text-xs font-semibold disabled:opacity-50"
          >
            {downloading ? 'Downloading…' : 'Download PNG'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function LibraryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [groups, setGroups] = useState<LibraryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await iconicApi.listLibrary(id)
      const data: LibraryGroup[] = res.data
      setGroups(data)
      if (data.length > 0 && !activeType) {
        setActiveType(data[0].asset_type)
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to load library')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const totalAssets = groups.reduce((n, g) => n + g.assets.length, 0)
  const activeGroup = groups.find(g => g.asset_type === activeType) ?? groups[0] ?? null

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/projects/${id}`)}
              className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"
            >
              ← Brand DNA
            </button>
            <span className="text-zinc-600">/</span>
            <h1 className="text-white font-semibold">Asset Library</h1>
            {!loading && (
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                {totalAssets} asset{totalAssets !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/generate')}
            className="bg-[#F5A623] text-black text-sm font-semibold px-4 py-2 rounded-lg"
          >
            + Create Asset
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-zinc-400">Loading library…</div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
            {error}
            <button onClick={load} className="ml-3 underline">Retry</button>
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-zinc-400 text-lg">No assets yet</p>
            <p className="text-zinc-500 text-sm">Generate your first asset to start building the library</p>
            <button
              onClick={() => router.push('/generate')}
              className="mt-4 bg-[#F5A623] text-black text-sm font-semibold px-5 py-2.5 rounded-lg"
            >
              Create First Asset
            </button>
          </div>
        )}

        {!loading && groups.length > 0 && (
          <>
            {/* Type tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {groups.map(g => (
                <button
                  key={g.asset_type}
                  onClick={() => setActiveType(g.asset_type)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeType === g.asset_type
                      ? 'bg-[#F5A623] text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span>{TYPE_ICONS[g.asset_type] ?? '🖼️'}</span>
                  <span>{g.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeType === g.asset_type ? 'bg-black/20 text-black' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {g.assets.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Asset grid */}
            {activeGroup && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {activeGroup.assets.map(asset => (
                    <AssetCard key={asset.request_id} asset={asset} projectId={id} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
