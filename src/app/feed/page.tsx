'use client'

import { useState } from 'react'

export default function FeedPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ feeds: Array<{ type: string; title: string; href: string }> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/feed?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">RSS / Feed Detector</h1>
      <p className="text-gray-500">Поиск RSS/Atom лент на странице</p>
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
          {data.feeds.length === 0 && <p className="text-gray-400 italic">Ленты не найдены</p>}
          {data.feeds.map((f, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-4 flex items-center gap-3">
              <span className="text-xs font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{f.type}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{f.title}</p>
                <code className="text-xs text-gray-500 break-all">{f.href}</code>
              </div>
              <a href={f.href} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">Open</a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
