'use client'

import { useState } from 'react'

export default function SSRFPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/ssrf?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">SSRF Checker (Beta)</h1>
      <p className="text-gray-500">Базовая проверка на Server-Side Request Forgery</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/page?url=..."
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Проверить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">{data.note}</p>
          {data.results.map((r: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 p-3 border rounded-xl ${r.blocked ? 'bg-white dark:bg-gray-900 border-gray-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
              <span className={`w-3 h-3 shrink-0 rounded-full ${r.blocked ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{r.name}</span>
              <span className="text-xs text-gray-400 ml-auto">{r.blocked ? 'Blocked ✓' : '⚠ Доступен'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
