'use client'

import { useState } from 'react'

async function digest(algo: string, text: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function HashPage() {
  const [input, setInput] = useState('')
  const [hash, setHash] = useState<string | null>(null)
  const [algo, setAlgo] = useState('SHA-256')

  const generate = async () => {
    if (!input) return
    const h = await digest(algo, input)
    setHash(h)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Hash Generator</h1>
      <p className="text-gray-500">Генерация хешей SHA-1/SHA-256/SHA-384/SHA-512 (client-side)</p>
      <div className="flex gap-2">
        <select value={algo} onChange={e => setAlgo(e.target.value)}
          className="px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm">
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-384">SHA-384</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} rows={4} placeholder="Введите текст..."
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-blue-500" />
      <button onClick={generate} disabled={!input}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
        Сгенерировать
      </button>
      {hash && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">{algo}:</p>
          <code className="text-xs break-all font-mono">{hash}</code>
        </div>
      )}
    </div>
  )
}
