'use client'

import { useState } from 'react'

export default function PrefetchPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/prefetch?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  const REL_COLORS: Record<string, string> = {
    preload: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    preconnect: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    prefetch: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'dns-prefetch': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    prerender: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    modulepreload: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Prefetch / Preload Detector</h1>
      <p className="text-gray-500">Поиск &lt;link rel=&quot;prefetch/preload/preconnect/dns-prefetch/prerender/modulepreload&quot;&gt;</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Найти'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-2">
          {data.total === 0 && <p className="text-gray-400 italic">Prefetch-ресурсы не найдены</p>}
          {data.links.map((l: any, i: number) => (
            <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-3 flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${REL_COLORS[l.rel] || 'bg-gray-100 text-gray-700'}`}>{l.rel}</span>
              <code className="text-xs truncate flex-1">{l.href}</code>
              {l.as && <span className="text-xs text-gray-400">{l.as}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
