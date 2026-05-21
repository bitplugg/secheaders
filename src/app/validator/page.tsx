'use client'

import { useState } from 'react'

export default function ValidatorPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ total: number; errors: number; warnings: number; messages: Array<{ type: string; line: number | null; message: string; extract?: string }> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/validator?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">HTML Validator (W3C)</h1>
      <p className="text-gray-500">Проверка HTML через validator.w3.org</p>
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
          <div className="flex gap-3 text-sm">
            <span>Всего: <strong>{data.total}</strong></span>
            <span className="text-red-600">Ошибок: <strong>{data.errors}</strong></span>
            <span className="text-amber-600">Предупреждений: <strong>{data.warnings}</strong></span>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {data.messages.map((m, i) => (
              <div key={i} className={`p-2 rounded text-xs border ${m.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                <div className="flex gap-2">
                  <span className="font-medium uppercase">{m.type}</span>
                  {m.line && <span className="text-gray-400">line {m.line}</span>}
                </div>
                <p>{m.message}</p>
                {m.extract && <code className="block mt-0.5 text-gray-500 truncate">{m.extract}</code>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
