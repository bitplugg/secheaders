'use client'

import { useEffect, useState } from 'react'
import type { HistoryItem } from '@/lib/types'
import { ScoreBadge } from '@/components/ScoreBadge'

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('secheaders_history')
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('secheaders_history')
    setHistory([])
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">История сканирований</h1>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Сканирований пока нет</p>
      ) : (
        <div className="space-y-2">
          {history.map((item, i) => (
            <a
              key={i}
              href={`/?scan=${encodeURIComponent(item.url)}`}
              className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-400 transition"
            >
              <ScoreBadge grade={item.grade} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.url}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString('ru-RU')}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
