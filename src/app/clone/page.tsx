'use client'

import { useState } from 'react'

export default function ClonePage() {
  const [refUrl, setRefUrl] = useState('')
  const [testUrl, setTestUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refUrl.trim() || !testUrl.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const [r, t] = await Promise.all([
        fetch(`/api/clone?url=${encodeURIComponent(refUrl.trim())}`).then(r => r.json()),
        fetch(`/api/clone?url=${encodeURIComponent(testUrl.trim())}`).then(r => r.json()),
      ])
      if (!r.success || !t.success) { setError('Один из URL недоступен'); return }

      const refHeaders = r.data.headers
      const testHeaders = t.data.headers
      const diffs: string[] = []
      if (refHeaders.server !== testHeaders.server) diffs.push(`Server: ${refHeaders.server} → ${testHeaders.server}`)
      if (refHeaders['x-powered-by'] !== testHeaders['x-powered-by']) diffs.push(`X-Powered-By: ${refHeaders['x-powered-by']} → ${testHeaders['x-powered-by']}`)
      if (Math.abs(r.data.bodySize - t.data.bodySize) > 100) diffs.push(`Размер: ${r.data.bodySize} → ${t.data.bodySize} bytes`)
      if (refHeaders['content-type'] !== testHeaders['content-type']) diffs.push(`Content-Type: ${refHeaders['content-type']} → ${testHeaders['content-type']}`)

      setData({ ref: r.data, test: t.data, similar: diffs.length === 0, diffs })
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Clone Site Detector</h1>
      <p className="text-gray-500">Сравнивает заголовки и размер двух сайтов для выявления клонов</p>
      <form onSubmit={check} className="space-y-2">
        <input type="text" value={refUrl} onChange={e => setRefUrl(e.target.value)} placeholder="Оригинал https://original.com"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
        <input type="text" value={testUrl} onChange={e => setTestUrl(e.target.value)} placeholder="Подозрительный https://clone.com"
          className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
        <button type="submit" disabled={loading || !refUrl.trim() || !testUrl.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Сравнить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border text-center text-lg font-bold ${data.similar ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {data.similar ? 'Сайты идентичны (возможно клон)' : 'Сайты различаются'}
          </div>
          {data.diffs.length > 0 && <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-1">{data.diffs.map((d: string, i: number) => <p key={i} className="text-sm">{d}</p>)}</div>}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[data.ref, data.test].map((d: any, i: number) => <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-3"><p className="font-medium truncate">{d.url}</p><p className="text-gray-400">HTTP {d.status} | {(d.bodySize / 1024).toFixed(1)} KB</p></div>)}
          </div>
        </div>
      )}
    </div>
  )
}
