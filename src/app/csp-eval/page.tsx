'use client'

import { useState } from 'react'

export default function CSPEvalPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/csp-eval?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">CSP Evaluator</h1>
      <p className="text-gray-500">Анализ безопасности каждой директивы Content-Security-Policy</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Анализировать'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && !data.present && <p className="text-gray-400 italic">CSP заголовок не найден</p>}
      {data?.directives?.map((d: any, i: number) => (
        <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold text-sm">{d.name}</h3>
          <div className="flex flex-wrap gap-1">{d.values.map((v: string, j: number) => <span key={j} className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{v}</span>)}</div>
          {d.issues.length > 0 && <div className="space-y-1">{d.issues.map((iss: string, j: number) => <p key={j} className="text-xs text-red-600">⚠ {iss}</p>)}</div>}
        </div>
      ))}
      {data?.totalIssues > 0 && <p className="text-sm text-red-600 font-medium">Найдено проблем: {data.totalIssues}</p>}
    </div>
  )
}
