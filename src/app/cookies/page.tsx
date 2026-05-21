'use client'

import { useState } from 'react'

export default function CookiesPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ total: number; secure: number; httpOnly: number; sameSite: number; none: number; cookies: Array<{ name: string; value: string; attrs: Record<string, string> }> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/cookies?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cookie Inspector</h1>
      <p className="text-gray-500">Детальный анализ Set-Cookie заголовков</p>
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Всего', value: data.total, color: '' },
              { label: 'Secure', value: data.secure, color: 'text-emerald-600' },
              { label: 'HttpOnly', value: data.httpOnly, color: 'text-emerald-600' },
              { label: 'SameSite', value: data.sameSite, color: 'text-emerald-600' },
              { label: 'Без защиты', value: data.none, color: 'text-red-600' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          {data.cookies.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{c.name}</span>
                <span className="text-xs text-gray-400 truncate">{c.value}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(c.attrs).map(([k, v]) => (
                  <span key={k} className={`text-xs px-1.5 py-0.5 rounded ${['secure', 'httponly'].includes(k) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : k === 'samesite' && (v === 'strict' || v === 'lax') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {k}{v !== 'true' ? `=${v}` : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
