'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default function ReportPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!url) return
    setLoading(true)
    try {
      const res = await fetch(`/api/pdf?url=${encodeURIComponent(url)}`)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `secheaders-report-${url.replace(/[^a-z0-9]/gi, '_')}.html`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs />
      <h1 className="text-3xl font-bold">PDF / HTML Report</h1>
      <p className="text-gray-500">Сгенерировать HTML-отчёт сканирования — сохранить или распечатать в PDF.</p>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com"
        className="w-full p-3 border rounded-xl bg-white dark:bg-gray-900 text-sm" />
      <button onClick={handleDownload} disabled={loading || !url}
        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? 'Генерация...' : 'Скачать отчёт (HTML)'}
      </button>
      <p className="text-xs text-gray-400">Откройте HTML в браузере и нажмите Ctrl+P → «Сохранить как PDF» для получения PDF.</p>
    </div>
  )
}
