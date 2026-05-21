'use client'

import { useState } from 'react'

export default function RedirectsPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ steps: Array<{ url: string; status: number; location: string | null }>; count: number; final: string; loop?: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/redirects?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Redirect Chain Tracer</h1>
      <p className="text-gray-500">Отслеживание цепочки HTTP-редиректов</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Трассировать'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-3">
          {data.loop && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">Обнаружен цикл редиректов!</div>}
          <p className="text-sm text-gray-500">Шагов: <strong>{data.count}</strong> | Финальный URL: <code className="text-xs">{data.final}</code></p>
          <div className="space-y-2">
            {data.steps.map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${s.status >= 400 ? 'bg-red-100 text-red-700' : s.status >= 300 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {s.status}
                  </span>
                </div>
                <p className="text-xs font-mono break-all">{s.url}</p>
                {s.location && <p className="text-xs text-gray-400 mt-1">→ {s.location}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
