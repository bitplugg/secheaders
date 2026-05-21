'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null)

  useEffect(() => {
    fetch('/openapi.json').then(r => r.json()).then(setSpec)
  }, [])

  if (!spec) return <div className="p-8 text-center text-gray-400">Загрузка...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Breadcrumbs />
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      <p className="text-gray-500 mb-8">Все эндпоинты работают на Edge Runtime. Параметры передаются через query string.</p>

      <div className="space-y-6">
        {Object.entries(spec.paths).map(([path, methods]: [string, any]) => {
          const method = methods.get
          if (!method) return null
          const params = method.parameters || []

          return (
            <details key={path} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group open:ring-2 open:ring-blue-500">
              <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">GET</span>
                <code className="text-sm font-mono">{path}</code>
                <span className="text-sm text-gray-500 ml-auto">{method.summary}</span>
              </summary>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                {params.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Parameters</p>
                    <div className="space-y-2">
                      {params.map((p: any) => (
                        <div key={p.name} className="flex items-center gap-3 text-sm">
                          <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{p.name}</code>
                          {p.required && <span className="text-red-500 text-xs">required</span>}
                          <span className="text-gray-500">{p.schema?.type}</span>
                          {p.example && <span className="text-gray-400 text-xs">example: <code className="text-gray-600">{p.example}</code></span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">cURL</p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs overflow-x-auto">{`curl "${spec.servers[0].url}${path}${params.map((p: any) => `${params.indexOf(p) === 0 ? '?' : '&'}${p.name}=${p.example || '{value}'}`).join('')}"`}</pre>
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
