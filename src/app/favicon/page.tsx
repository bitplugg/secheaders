'use client'

import { useState } from 'react'

export default function FaviconPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/favicon?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Favicon Checker</h1>
      <p className="text-gray-500">Проверка иконок сайта</p>
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
        <div className="space-y-3">
          {data.htmlIcons?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Из HTML:</p>
              <div className="space-y-1">
                {data.htmlIcons.map((ic: any, i: number) => (
                  <div key={i} className="text-xs"><span className="text-gray-500">{ic.rel}</span> {ic.href} {ic.sizes && `(${ic.sizes})`}</div>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {data.results?.map((r: any, i: number) => (
              <div key={i} className={`flex items-center gap-2 p-3 border rounded-lg text-sm ${r.found ? 'bg-white dark:bg-gray-900 border-gray-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'}`}>
                <span className={`w-2 h-2 shrink-0 rounded-full ${r.found ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs truncate">{r.path.replace(data.base, '')}</p>
                  {r.found && <p className="text-xs text-gray-400">{r.type} {r.size ? `(${(r.size / 1024).toFixed(1)} KB)` : ''}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
