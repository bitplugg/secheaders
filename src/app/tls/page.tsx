'use client'

import { useState } from 'react'

export default function TLSPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/tls?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">TLS Checker</h1>
      <p className="text-gray-500">HTTPS, HSTS, Alt-Svc, HTTP/2, HTTP/3</p>
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
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'HTTPS', val: data.https, ok: data.https },
            { label: 'HSTS', val: data.hsts, ok: data.hsts },
            { label: 'HTTP/2', val: data.http2, ok: data.http2 },
            { label: 'HTTP/3', val: data.http3, ok: data.http3 },
            { label: 'TLS Connected', val: data.tlsConnected, ok: data.tlsConnected },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-gray-900 border rounded-xl p-3 flex items-center gap-3">
              <span className={`w-3 h-3 shrink-0 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{item.label}: {item.val ? '✓' : '✗'}</span>
            </div>
          ))}
          {data.altSvc && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 sm:col-span-2">
              <p className="text-xs text-gray-400">Alt-Svc</p>
              <code className="text-xs">{data.altSvc}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
