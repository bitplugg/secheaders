'use client'

import { useState } from 'react'

export default function SRIGenPage() {
  const [url, setUrl] = useState('')
  const [hash, setHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [algo, setAlgo] = useState('sha256')

  const generate = async () => {
    if (!url.trim()) return
    setLoading(true); setError(null); setHash(null)
    try {
      const res = await fetch(url.trim())
      const buf = await res.arrayBuffer()
      const h = await crypto.subtle.digest(algo.toUpperCase().replace('-', ''), buf)
      const b64 = btoa(String.fromCharCode(...new Uint8Array(h)))
      setHash(`${algo}-${b64}`)
    } catch {
      setError('Не удалось загрузить ресурс. Убедитесь, что URL доступен и CORS разрешён.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">SRI Generator</h1>
      <p className="text-gray-500">Генерация integrity-хеша для внешнего ресурса</p>
      <div className="flex gap-2">
        <select value={algo} onChange={e => setAlgo(e.target.value)} className="px-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm">
          <option value="sha256">SHA-256</option><option value="sha384">SHA-384</option><option value="sha512">SHA-512</option>
        </select>
      </div>
      <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://cdn.example.com/lib.js"
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
      <button onClick={generate} disabled={loading || !url.trim()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
        {loading ? '...' : 'Сгенерировать'}
      </button>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {hash && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2">
          <p className="text-xs text-gray-400">integrity</p>
          <code className="text-sm break-all font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded block">{hash}</code>
          <button onClick={() => navigator.clipboard.writeText(hash)} className="text-xs text-blue-600 hover:underline">Копировать</button>
        </div>
      )}
    </div>
  )
}
