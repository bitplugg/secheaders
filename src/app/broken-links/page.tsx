'use client'

import { useState } from 'react'

export default function BrokenLinksPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/broken-links?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Broken Links</h1>
      <p className="text-gray-500">Поиск битых ссылок на странице (проверка до 20 ссылок HEAD-запросом)</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Проверить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-3">
          <div className="flex gap-3 text-sm">
            <span>Всего: <strong>{data.totalFound}</strong></span>
            <span className="text-emerald-600">OK: <strong>{data.ok}</strong></span>
            <span className="text-red-600">Битых: <strong>{data.broken}</strong></span>
          </div>
          <div className="space-y-1">
            {data.links.map((l: any, i: number) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded text-xs border ${l.ok ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <span className={`w-2 h-2 shrink-0 rounded-full ${l.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-400 w-10 shrink-0">{l.status || 'ERR'}</span>
                <code className="truncate">{l.url}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
