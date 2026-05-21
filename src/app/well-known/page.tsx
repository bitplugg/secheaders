'use client'

import { useState } from 'react'

export default function WellKnownPage() {
  const [url, setUrl] = useState('')
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
      const res = await fetch(`/api/well-known?url=${encodeURIComponent(url.trim())}`)
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
      <h1 className="text-3xl font-bold tracking-tight">Robots.txt & Security.txt</h1>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Проверить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-6">
          {['security.txt', 'robots.txt'].map(key => {
            const item = data[key]
            if (!item) return null
            return (
              <div key={key} className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.found ? 'bg-green-500' : 'bg-red-500'}`} />
                  <h2 className="font-semibold">{key}</h2>
                  {item.status && <span className="text-xs text-gray-500">HTTP {item.status}</span>}
                </div>
                {item.content ? (
                  <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto max-h-60">{item.content}</pre>
                ) : (
                  <p className="text-sm text-gray-400 italic">Не найден</p>
                )}
                {item.error && <p className="text-sm text-red-500">{item.error}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
