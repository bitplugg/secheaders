'use client'

import { useState } from 'react'

export default function SRIPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ total: number; withSRI: number; percent: number; resources: any[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/sri?url=${encodeURIComponent(url.trim())}`)
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
      <h1 className="text-3xl font-bold tracking-tight">SRI Checker</h1>
      <p className="text-gray-500">Проверка Subresource Integrity на внешних скриптах и стилях</p>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{data.total}</p>
              <p className="text-xs text-gray-500">Всего ресурсов</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{data.withSRI}</p>
              <p className="text-xs text-gray-500">С SRI</p>
            </div>
            <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${data.percent >= 80 ? 'text-emerald-600' : data.percent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {data.percent}%
              </p>
              <p className="text-xs text-gray-500">Покрытие</p>
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.resources.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border rounded-lg text-sm ${r.hasSRI ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}>
                <span className={`w-2 h-2 shrink-0 rounded-full ${r.hasSRI ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-gray-400 w-12">{r.tag}</span>
                <code className="text-xs truncate flex-1">{r.src}</code>
                {r.hasSRI && <span className="text-xs text-emerald-600 shrink-0">integrity ✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
