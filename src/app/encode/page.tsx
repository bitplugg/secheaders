'use client'

import { useState } from 'react'

export default function EncodePage() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [type, setType] = useState<'base64' | 'url'>('base64')

  const result = (() => {
    if (!input) return ''
    try {
      if (type === 'base64') {
        return mode === 'encode' ? btoa(input) : atob(input)
      } else {
        return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
      }
    } catch {
      return 'Ошибка преобразования'
    }
  })()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Base64 / URL Encode-Decode</h1>
      <p className="text-gray-500">Кодирование и декодирование (client-side)</p>
      <div className="flex gap-2">
        <select value={type} onChange={e => setType(e.target.value as any)}
          className="px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm">
          <option value="base64">Base64</option>
          <option value="url">URL</option>
        </select>
        <select value={mode} onChange={e => setMode(e.target.value as any)}
          className="px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm">
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </select>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} placeholder="Введите текст..."
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-1">Результат:</p>
        <code className="text-sm break-all">{result || <span className="text-gray-400 italic">ожидание ввода</span>}</code>
      </div>
    </div>
  )
}
