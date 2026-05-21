'use client'

import { useState } from 'react'

const TYPE_LABELS: Record<string, string> = {
  A: 'IPv4', AAAA: 'IPv6', MX: 'Mail Exchange', TXT: 'Text',
  NS: 'Nameserver', CNAME: 'Canonical Name', SOA: 'Start of Authority',
  CAA: 'CAA', SRV: 'Service',
}

export default function DNSPage() {
  const [domain, setDomain] = useState('')
  const [data, setData] = useState<Record<string, any[]> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(`/api/dns?domain=${encodeURIComponent(domain.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data.records)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">DNS Checker</h1>
      <p className="text-gray-500">Проверка DNS-записей через Cloudflare DNS-over-HTTPS</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !domain.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Проверить'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(data).map(([type, records]) => (
            <div key={type} className="bg-white dark:bg-gray-900 border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{type}</span>
                <span className="text-xs text-gray-500">{TYPE_LABELS[type] || ''}</span>
              </div>
              <div className="space-y-1">
                {records.map((r: any, i: number) => (
                  <div key={i} className="text-xs">
                    {r.error ? (
                      <span className="text-red-500">{r.error}</span>
                    ) : r.note ? (
                      <span className="text-gray-400 italic">{r.note}</span>
                    ) : (
                      <div>
                        <code className="font-mono break-all">{r.value}</code>
                        {r.ttl && <span className="text-gray-400 ml-1">TTL: {r.ttl}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
