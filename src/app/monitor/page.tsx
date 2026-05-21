'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'

type MonitorEntry = { url: string; status: string; grade: string; responseTime: number; checkedAt: string; error?: string }

export default function MonitorPage() {
  const [urls, setUrls] = useState('')
  const [results, setResults] = useState<MonitorEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    setLoading(true)
    const list = urls.split('\n').map(s => s.trim()).filter(Boolean).join(',')
    try {
      const res = await fetch(`/api/monitor?urls=${encodeURIComponent(list)}`)
      const json = await res.json()
      if (json.success) setResults(json.data.results)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs />
      <h1 className="text-3xl font-bold">Monitoring</h1>
      <p className="text-gray-500">Проверка доступности и безопасности нескольких сайтов. Введите по одному URL на строку.</p>

      <textarea value={urls} onChange={e => setUrls(e.target.value)} rows={5}
        className="w-full p-3 border rounded-xl bg-white dark:bg-gray-900 text-sm font-mono"
        placeholder="https://google.com&#10;https://github.com&#10;https://habr.com" />

      <button onClick={check} disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? 'Проверка...' : 'Проверить'}
      </button>

      {results && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`p-4 rounded-xl border text-sm ${
              r.status === 'ok' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
              r.status === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
              'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${r.status === 'ok' ? 'bg-emerald-500' : r.status === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <code className="flex-1">{r.url}</code>
                <span className="font-bold">{r.grade}</span>
                <span className="text-gray-400">{r.responseTime}ms</span>
                {r.error && <span className="text-red-500 text-xs">{r.error}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
