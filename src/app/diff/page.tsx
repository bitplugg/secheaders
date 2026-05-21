'use client'

import { useState } from 'react'

export default function DiffPage() {
  const [urlA, setUrlA] = useState('')
  const [urlB, setUrlB] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urlA.trim() || !urlB.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/diff?urlA=${encodeURIComponent(urlA.trim())}&urlB=${encodeURIComponent(urlB.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">HTTP Diff</h1>
      <p className="text-gray-500">Сравнение заголовков и размера ответа двух URL</p>
      <form onSubmit={compare} className="space-y-2">
        <input type="text" value={urlA} onChange={e => setUrlA(e.target.value)} placeholder="URL A"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
        <input type="text" value={urlB} onChange={e => setUrlB(e.target.value)} placeholder="URL B"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading || !urlA.trim() || !urlB.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Сравнить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[data.a, data.b].map((x: any, i: number) => (
              <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-sm">
                <p className="font-medium truncate">{x.url}</p>
                <p className="text-xs text-gray-500">HTTP {x.status} | {(x.bodySize / 1024).toFixed(1)} KB</p>
              </div>
            ))}
          </div>
          {Object.keys(data.headerDiff).length > 0 && (
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <p className="font-semibold text-sm mb-2">Различия в заголовках</p>
              <div className="space-y-2 text-xs">
                {Object.entries(data.headerDiff).map(([k, v]: [string, any]) => (
                  <div key={k} className="border-b pb-1">
                    <p className="font-medium">{k}</p>
                    <p className="text-emerald-600">A: {v.a || '(пусто)'}</p>
                    <p className="text-blue-600">B: {v.b || '(пусто)'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
