'use client'

import { useState } from 'react'

export default function WhoisPage() {
  const [domain, setDomain] = useState('')
  const [data, setData] = useState<{ domain: string; info: Record<string, string> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/whois?domain=${encodeURIComponent(domain.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">WHOIS Lookup</h1>
      <p className="text-gray-500">Регистрационные данные домена через RDAP</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !domain.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Поиск'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2">
          {Object.entries(data.info).map(([k, v]) => (
            <div key={k} className="text-sm border-b pb-1 last:border-0">
              <span className="text-gray-400">{k}:</span> {v}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
