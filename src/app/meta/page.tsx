'use client'

import { useState } from 'react'

export default function MetaPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ title: string | null; og: Record<string, string>; twitter: Record<string, string>; meta: Record<string, string> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/meta?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Meta Tags Analyzer</h1>
      <p className="text-gray-500">Open Graph, Twitter Cards, meta-теги</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Анализировать'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-4">
          {data.title && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-1">Title</h2>
              <p className="text-sm">{data.title}</p>
            </div>
          )}
          {Object.keys(data.og).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2">Open Graph</h2>
              {Object.entries(data.og).map(([k, v]) => (
                <div key={k} className="text-xs mb-1">
                  <span className="text-gray-400">{k}:</span> {v}
                </div>
              ))}
            </div>
          )}
          {Object.keys(data.twitter).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2">Twitter Card</h2>
              {Object.entries(data.twitter).map(([k, v]) => (
                <div key={k} className="text-xs mb-1">
                  <span className="text-gray-400">{k}:</span> {v}
                </div>
              ))}
            </div>
          )}
          {Object.keys(data.meta).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <h2 className="font-semibold text-sm mb-2">Meta</h2>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {Object.entries(data.meta).map(([k, v]) => (
                  <div key={k} className="text-xs">
                    <span className="text-gray-400">{k}:</span> {v}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!data.title && Object.keys(data.og).length === 0 && Object.keys(data.twitter).length === 0 && Object.keys(data.meta).length === 0 && (
            <p className="text-gray-400 italic">Мета-теги не найдены</p>
          )}
        </div>
      )}
    </div>
  )
}
