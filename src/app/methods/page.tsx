'use client'

import { useState } from 'react'

export default function MethodsPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ status: number; methods: string[]; raw: string | null; note?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/methods?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">HTTP Methods Checker</h1>
      <p className="text-gray-500">Проверка разрешённых HTTP-методов через OPTIONS запрос</p>
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
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
          <p className="text-sm">HTTP статус: <strong>{data.status}</strong></p>
          {data.methods.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.methods.map(m => (
                <span key={m} className={`text-xs font-medium px-2.5 py-1 rounded ${['GET', 'HEAD', 'OPTIONS'].includes(m.toUpperCase()) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : m.toUpperCase() === 'POST' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                  {m}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">{data.note}</p>
          )}
        </div>
      )}
    </div>
  )
}
