'use client'

import { useState } from 'react'

export default function PrettyPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const format = () => {
    setError(null)
    try {
      const parsed = JSON.parse(input.trim())
      setOutput(JSON.stringify(parsed, null, 2))
    } catch {
      try {
        const parsed = new DOMParser().parseFromString(input.trim(), 'text/xml')
        const serializer = new XMLSerializer()
        setOutput(serializer.serializeToString(parsed))
      } catch {
        setError('Не удалось распарсить. Убедитесь, что это JSON или XML.')
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pretty Print</h1>
      <p className="text-gray-500">Форматирование JSON/XML (client-side)</p>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={6} placeholder='{"key": "value"}'
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-2">
        <button onClick={format} disabled={!input.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          Форматировать
        </button>
        <button onClick={() => { setInput(''); setOutput(''); setError(null) }}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
          Очистить
        </button>
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {output && <pre className="text-xs bg-white dark:bg-gray-900 border rounded-xl p-4 overflow-x-auto max-h-96">{output}</pre>}
    </div>
  )
}
