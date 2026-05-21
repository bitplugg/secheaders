'use client'

import { useState } from 'react'
import { ScoreBadge, ScoreBar } from '@/components/ScoreBadge'
import type { ScanResult } from '@/lib/types'

export default function ComparePage() {
  const [urlA, setUrlA] = useState('')
  const [urlB, setUrlB] = useState('')
  const [resultA, setResultA] = useState<ScanResult | null>(null)
  const [resultB, setResultB] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState<'A' | 'B' | 'both' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const compare = async () => {
    if (!urlA.trim() || !urlB.trim()) return
    setLoading('both')
    setError(null)
    setResultA(null)
    setResultB(null)
    try {
      const [ra, rb] = await Promise.all([
        fetch(`/api/scan?url=${encodeURIComponent(urlA.trim())}`).then(r => r.json()),
        fetch(`/api/scan?url=${encodeURIComponent(urlB.trim())}`).then(r => r.json()),
      ])
      if (ra.success) setResultA(ra.data)
      if (rb.success) setResultB(rb.data)
      if (!ra.success && !rb.success) setError('Оба URL недоступны')
    } catch {
      setError('Network error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Сравнение двух сайтов</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <input type="text" value={urlA} onChange={e => setUrlA(e.target.value)} placeholder="https://site1.com"
          className="px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
        <input type="text" value={urlB} onChange={e => setUrlB(e.target.value)} placeholder="https://site2.com"
          className="px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={compare} disabled={loading === 'both' || !urlA.trim() || !urlB.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
        {loading === 'both' ? 'Загрузка...' : 'Сравнить'}
      </button>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {(resultA || resultB) && (
        <div className="grid sm:grid-cols-2 gap-6">
          {[resultA, resultB].map((r, i) => r && (
            <div key={i} className="space-y-3">
              <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ScoreBadge grade={r.grade} />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.url}</p>
                    <p className="text-xs text-gray-500">Счёт: {r.overallScore}/{r.maxScore}</p>
                  </div>
                </div>
                <ScoreBar score={r.overallScore} maxScore={r.maxScore} />
              </div>
              <div className="space-y-2">
                {r.headers.map(h => (
                  <div key={h.name} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border rounded-lg text-sm">
                    <span className="truncate">{h.displayName}</span>
                    <span className={`shrink-0 ml-2 text-xs font-medium ${h.score >= 4 ? 'text-emerald-600' : h.score >= 2 ? 'text-amber-600' : 'text-red-600'}`}>
                      {h.score}/{h.maxScore}
                    </span>
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
