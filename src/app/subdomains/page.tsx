'use client'

import { useState } from 'react'

export default function SubdomainsPage() {
  const [domain, setDomain] = useState('')
  const [data, setData] = useState<{ domain: string; count: number; subdomains: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/subdomains?domain=${encodeURIComponent(domain.trim())}`)
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
      <h1 className="text-3xl font-bold tracking-tight">Subdomain Discovery</h1>
      <p className="text-gray-500">Поиск поддоменов через Certificate Transparency logs (crt.sh)</p>
      <form onSubmit={search} className="flex gap-2">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !domain.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Найдено поддоменов: <strong>{data.count}</strong></p>
          <div className="max-h-96 overflow-y-auto border rounded-xl bg-white dark:bg-gray-900">
            {data.subdomains.map((s, i) => (
              <div key={i} className="px-4 py-2 text-sm font-mono border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
