'use client'

import { useState } from 'react'

export default function EmailSecurityPage() {
  const [domain, setDomain] = useState('')
  const [data, setData] = useState<{ domain: string; records: Record<string, { value: string; parsed?: Record<string, string> }> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/email-security?domain=${encodeURIComponent(domain.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Email Security Checker</h1>
      <p className="text-gray-500">Проверка SPF, DKIM и DMARC DNS-записей</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !domain.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Проверить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-4">
          {!data.records.SPF && !data.records.DMARC && !data.records.DKIM && (
            <p className="text-sm text-gray-400 italic">Записи не найдены. Домен не защищён от подделки email.</p>
          )}
          {Object.entries(data.records).map(([type, rec]) => (
            <div key={type} className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                {type}
                {['SPF', 'DKIM', 'DMARC'].includes(type) && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{type}</span>
                )}
              </h2>
              <code className="text-xs block bg-gray-50 dark:bg-gray-800 p-2 rounded break-all">{rec.value}</code>
              {rec.parsed && (
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(rec.parsed).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-400">{k}:</span> {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
