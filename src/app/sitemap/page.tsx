'use client'

import { useState } from 'react'

export default function SitemapPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ found: boolean; status: number; urlCount: number; urls: string[]; contentType: string | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/sitemap?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Sitemap Checker</h1>
      <p className="text-gray-500">Проверка наличия и содержимого /sitemap.xml</p>
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
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${data.found ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{data.found ? 'Sitemap найден' : 'Sitemap не найден'}</span>
            <span className="text-xs text-gray-500">HTTP {data.status}</span>
          </div>
          {data.found && (
            <>
              <p className="text-sm text-gray-500">URL в sitemap: <strong>{data.urlCount}</strong></p>
              <div className="max-h-96 overflow-y-auto space-y-1">
                {data.urls.map((u, i) => (
                  <div key={i} className="p-1.5 bg-white dark:bg-gray-900 border rounded text-xs font-mono break-all">{u}</div>
                ))}
                {data.urlCount > 100 && <p className="text-xs text-gray-400 italic">Показаны первые 100 из {data.urlCount}</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
