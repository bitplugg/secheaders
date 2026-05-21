'use client'

import { useState } from 'react'

export default function CDNPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ detected: string[]; headers: Record<string, string> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/cdn?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">CDN Detector</h1>
      <p className="text-gray-500">Определение CDN и серверного ПО по заголовкам</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Определить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-4">
          {data.detected.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.detected.map(d => (
                <span key={d} className="text-sm font-medium px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">{d}</span>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 italic">CDN не определён</p>}
          <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Заголовки:</p>
            <div className="space-y-1 text-xs max-h-60 overflow-y-auto">
              {Object.entries(data.headers).map(([k, v]) => (
                <div key={k}><span className="text-gray-500">{k}:</span> {v as string}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
