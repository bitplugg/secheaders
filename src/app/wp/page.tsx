'use client'

import { useState } from 'react'

export default function WPPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/wp?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">WordPress Scanner</h1>
      <p className="text-gray-500">Определение WordPress, версии, плагинов, тем по типовым путям</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Сканировать'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border text-center text-lg font-bold ${data.isWP ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
            {data.isWP ? `WordPress обнаружен (достоверность ${data.confidence})` : 'WordPress не обнаружен'}
          </div>
          {data.version && <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-center"><p className="text-xs text-gray-400">Версия</p><p className="text-xl font-bold">{data.version}</p></div>}
          <div className="space-y-1">
            {data.results?.map((r: any, i: number) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded text-xs border ${r.found ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' : 'bg-white dark:bg-gray-900 border-gray-200'}`}>
                <span className={`w-2 h-2 shrink-0 rounded-full ${r.found ? 'bg-amber-500' : 'bg-gray-300'}`} />
                <span className="text-gray-400 w-16 shrink-0">{r.status || 'ERR'}</span>
                <span className="font-medium">{r.label}</span>
                <code className="text-gray-500 ml-auto">{r.path}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
