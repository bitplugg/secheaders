'use client'

import { useEffect, useState } from 'react'
import type { HistoryItem } from '@/lib/types'

export default function HistoryChartPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('secheaders_history')
      if (raw) setHistory(JSON.parse(raw).reverse())
    } catch { /* ignore */ }
  }, [])

  if (history.length === 0) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-400 italic">Нет данных для графика</div>

  const grades = ['A', 'B', 'C', 'D', 'E', 'F']
  const maxCount = Math.max(...grades.map(g => history.filter(h => h.grade === g).length), 1)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Security Score History</h1>
      <p className="text-gray-500">Распределение оценок по сканированиям</p>
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-4">
        <div className="flex items-end gap-3 h-48">
          {grades.map(g => {
            const count = history.filter(h => h.grade === g).length
            const pct = (count / maxCount) * 100
            const colors: Record<string, string> = { A: 'bg-emerald-500', B: 'bg-green-500', C: 'bg-lime-500', D: 'bg-yellow-500', E: 'bg-orange-500', F: 'bg-red-500' }
            return <div key={g} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-xs font-bold">{count}</span>
              <div className="w-full rounded-t" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: colors[g] || '#999' }} />
              <span className="text-xs font-bold">{g}</span>
            </div>
          })}
        </div>
        <div className="text-xs text-gray-400 text-center">Всего сканирований: {history.length}</div>
      </div>
      <div className="space-y-1">
        {history.slice(-10).reverse().map((h, i) => (
          <div key={i} className="flex items-center gap-2 text-xs bg-white dark:bg-gray-900 border rounded-lg p-2">
            <span className={`font-bold px-1.5 py-0.5 rounded ${h.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : h.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{h.grade}</span>
            <code className="truncate">{h.url}</code>
            <span className="text-gray-400 ml-auto">{new Date(h.timestamp).toLocaleDateString('ru-RU')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
