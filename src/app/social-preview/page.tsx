'use client'

import { useState } from 'react'

export default function SocialPreviewPage() {
  const [url, setUrl] = useState('')
  const [data, setData] = useState<{ title: string | null; og: Record<string, string>; twitter: Record<string, string> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true); setError(null); setData(null)
    try {
      const res = await fetch(`/api/meta?url=${encodeURIComponent(url.trim())}`)
      const json = await res.json()
      if (!json.success) setError(json.error)
      else setData(json.data)
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  const ogImage = data?.og?.['og:image']
  const twImage = data?.twitter?.['twitter:image']
  const image = ogImage || twImage

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Social Preview</h1>
      <p className="text-gray-500">Как выглядит ссылка в соцсетях</p>
      <form onSubmit={check} className="flex gap-2">
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
          className="flex-1 px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          {loading ? '...' : 'Показать'}
        </button>
      </form>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {data && (
        <div className="space-y-4">
          <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-900 max-w-md mx-auto shadow-sm">
            {image && <img src={image} alt="" className="w-full h-48 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
            <div className="p-3 space-y-1">
              <p className="text-xs text-gray-500 uppercase">{data.og?.['og:site_name'] || new URL(url).hostname}</p>
              <p className="font-semibold text-sm">{data.og?.['og:title'] || data.twitter?.['twitter:title'] || data.title || 'No title'}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{data.og?.['og:description'] || data.twitter?.['twitter:description'] || ''}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-2 text-xs">
            {Object.entries(data.og).map(([k, v]) => (
              <div key={k}><span className="text-gray-400">{k}:</span> {v}</div>
            ))}
            {Object.entries(data.twitter).map(([k, v]) => (
              <div key={k}><span className="text-gray-400">{k}:</span> {v}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
