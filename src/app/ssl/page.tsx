'use client'

import { useState } from 'react'

interface SSLData {
  https: boolean
  hsts: boolean
  redirect: string | null
  note: string
}

export default function SSLPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<SSLData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/ssl?url=${encodeURIComponent(url.trim())}`)
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
      <h1 className="text-3xl font-bold tracking-tight">SSL / HTTPS Checker</h1>
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
        <div className="space-y-3">
          {[
            { label: 'HTTPS', ok: data.https },
            { label: 'HSTS', ok: data.hsts },
            { label: 'Редирект', ok: data.redirect, val: data.redirect },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border rounded-lg">
              <span className={`w-3 h-3 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.val && <code className="text-xs text-gray-500 truncate">{item.val}</code>}
            </div>
          ))}
          {data.note && <p className="text-sm text-gray-500">{data.note}</p>}
        </div>
      )}
    </div>
  )
}
