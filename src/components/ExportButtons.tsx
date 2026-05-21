'use client'

import type { ScanResult } from '@/lib/types'
import { downloadJSON, downloadYAML } from '@/lib/export'

export function ExportButtons({ result }: { result: ScanResult }) {
  const hostname = (() => { try { return new URL(result.url).hostname } catch { return 'result' } })()

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={() => downloadJSON(result, `secheaders-${hostname}.json`)}
        className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        JSON
      </button>
      <button onClick={() => downloadYAML(result, `secheaders-${hostname}.yaml`)}
        className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        YAML
      </button>
      <button onClick={async () => {
        const data = btoa(encodeURIComponent(JSON.stringify({ url: result.url, timestamp: result.timestamp })))
        const link = `${window.location.origin}?report=${data}`
        try { await navigator.clipboard.writeText(link); alert('Ссылка скопирована') }
        catch { prompt('Скопируйте ссылку:', link) }
      }} className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        Share
      </button>
    </div>
  )
}
