'use client'

import { useState } from 'react'

export default function CSPPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [cspData, setCspData] = useState<{ raw: string; directives: Record<string, string[]> } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setCspData(null)

    try {
      const res = await fetch(`/api/csp-dump?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Ошибка')
      } else if (!json.data) {
        setError(json.message || 'CSP заголовок не найден')
      } else {
        setCspData(json.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">CSP Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Разбор Content-Security-Policy заголовка: директива за директивой.
        </p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm"
        >
          {loading ? 'Загрузка...' : 'Анализировать'}
        </button>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {cspData && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h2 className="font-semibold mb-2">Raw CSP</h2>
            <code className="text-xs break-all bg-gray-50 dark:bg-gray-800 p-2 rounded block">{cspData.raw}</code>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(cspData.directives).map(([dir, vals]) => (
              <div key={dir} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">{dir}</h3>
                {vals.length > 0 ? (
                  <ul className="space-y-1">
                    {vals.map((v, i) => (
                      <li key={i} className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                        {v}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">без значений</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
