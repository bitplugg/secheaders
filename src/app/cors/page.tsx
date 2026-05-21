'use client'

import { useState } from 'react'

export default function CORSPage() {
  const [url, setUrl] = useState('')
  const [origin, setOrigin] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const params = new URLSearchParams({ url: url.trim() })
      if (origin.trim()) params.set('origin', origin.trim())
      const res = await fetch(`/api/cors?${params}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">CORS Tester</h1>
      <form onSubmit={check} className="space-y-3">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Origin (опционально, например https://mysite.com)"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Проверить CORS'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
          <div className={`p-3 rounded-lg text-sm font-medium ${data.verdict.includes('CRITICAL') ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : data.verdict.includes('не найдены') ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
            {data.verdict}
          </div>
          <p className="text-sm">Статус: <strong>{data.status}</strong></p>
          {Object.keys(data.headers).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">CORS заголовки:</p>
              {Object.entries(data.headers).map(([k, v]) => (
                <div key={k} className="text-xs font-mono bg-gray-50 dark:bg-gray-800 p-1.5 rounded mb-1">
                  {k}: {v as string}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
