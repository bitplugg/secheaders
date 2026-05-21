'use client'

import { useState } from 'react'
import { ScanForm } from '@/components/ScanForm'
import { ScoreBadge, ScoreBar } from '@/components/ScoreBadge'
import { ResultCard } from '@/components/ResultCard'
import type { ScanResult } from '@/lib/types'

export default function BatchPage() {
  const [urls, setUrls] = useState('')
  const [results, setResults] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(false)

  const scanAll = async () => {
    const list = urls.split('\n').map(s => s.trim()).filter(Boolean)
    if (list.length === 0) return
    setLoading(true)
    setResults([])
    const out: ScanResult[] = []
    for (const url of list) {
      try {
        const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`)
        const json = await res.json()
        if (json.success) out.push(json.data)
      } catch { /* skip */ }
    }
    setResults(out)
    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Batch Scan</h1>
      <p className="text-gray-500">По одному URL на строку</p>
      <textarea
        value={urls}
        onChange={e => setUrls(e.target.value)}
        rows={6}
        placeholder="https://example1.com&#10;https://example2.com"
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button onClick={scanAll} disabled={loading || !urls.trim()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
        {loading ? `Сканирую ${results.length}...` : `Сканировать все (${urls.split('\n').filter(Boolean).length})`}
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ScoreBadge grade={r.grade} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.url}</p>
                    <p className="text-xs text-gray-500">{r.overallScore}/{r.maxScore}</p>
                  </div>
                </div>
                <ScoreBar score={r.overallScore} maxScore={r.maxScore} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
