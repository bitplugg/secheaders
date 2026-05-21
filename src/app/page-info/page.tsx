'use client'

import { useState } from 'react'

export default function PageInfoPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/page-info?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Page Info</h1>
      <p className="text-gray-500">Метаданные, размер, заголовки ответа</p>
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
            { label: 'HTTP Status', val: data.status },
            { label: 'Content-Type', val: data.contentType },
            { label: 'Размер', val: data.sizeBytes > 1024 ? `${(data.sizeBytes / 1024).toFixed(1)} KB` : `${data.sizeBytes} B` },
            { label: 'Загрузка', val: `${data.loadMs}ms` },
            { label: 'Last-Modified', val: data.lastModified },
            { label: 'ETag', val: data.etag },
            { label: 'Lang', val: data.lang },
            { label: 'Charset', val: data.charset },
            { label: 'Viewport', val: data.viewport },
            { label: 'Canonical', val: data.canonical },
            { label: 'Favicon', val: data.favicon },
          ].map(item => item.val && (
            <div key={item.label} className="bg-white dark:bg-gray-900 border rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
              <p className="text-sm break-all">{item.val}</p>
            </div>
          ))}
          {data.hreflangs?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 sm:col-span-2">
              <p className="text-xs text-gray-400 mb-1">Hreflang</p>
              {data.hreflangs.map((h: any, i: number) => (
                <div key={i} className="text-xs mb-0.5"><span className="font-medium">{h.lang}:</span> {h.href}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
