'use client'

import { useState } from 'react'

export default function ServerPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ url: string; status: number; headers: Record<string, string>; generators: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/server?url=${encodeURIComponent(url.trim())}`)
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Server Info</h1>
      <p className="text-gray-500">Определение серверного ПО по HTTP-заголовкам и meta-тегам</p>
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
        <div className="space-y-4">
          {data.generators.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2">CMS / Generator</h2>
              {data.generators.map((g, i) => (
                <span key={i} className="inline-block text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-1">{g}</span>
              ))}
            </div>
          )}
          <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
            <h2 className="font-semibold text-sm mb-2">HTTP-заголовки</h2>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {Object.entries(data.headers).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="font-medium text-gray-500">{k}:</span>{' '}
                  <code className="font-mono break-all">{v}</code>
                </div>
              ))}
              {Object.keys(data.headers).length === 0 && (
                <p className="text-gray-400 italic text-sm">Нет информативных заголовков</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
