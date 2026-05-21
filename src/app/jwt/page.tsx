'use client'

import { useState } from 'react'

function decodeBase64Url(s: string): string {
  try {
    return atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  } catch {
    return ''
  }
}

function tryParseJSON(s: string): string {
  try {
    return JSON.stringify(JSON.parse(s), null, 2)
  } catch {
    return s
  }
}

export default function JWTPage() {
  const [token, setToken] = useState('')
  const [header, setHeader] = useState('')
  const [payload, setPayload] = useState('')
  const [sig, setSig] = useState('')
  const [error, setError] = useState<string | null>(null)

  const decode = () => {
    setError(null)
    setHeader('')
    setPayload('')
    setSig('')

    const parts = token.trim().split('.')
    if (parts.length !== 3) {
      setError('Некорректный JWT. Ожидается 3 части, разделённые точками.')
      return
    }

    try {
      const h = tryParseJSON(decodeBase64Url(parts[0]))
      if (!h) throw new Error('Header parse error')
      setHeader(h)
      const p = tryParseJSON(decodeBase64Url(parts[1]))
      if (!p) throw new Error('Payload parse error')
      setPayload(p)
      setSig(parts[2].slice(0, 32) + '...')
    } catch {
      setError('Ошибка декодирования. Проверьте формат токена.')
    }
  }

  const clear = () => {
    setToken('')
    setHeader('')
    setPayload('')
    setSig('')
    setError(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">JWT Decoder</h1>
      <p className="text-gray-500">Декодирование JWT без проверки подписи (client-side, ничего не отправляется)</p>
      <textarea
        value={token}
        onChange={e => setToken(e.target.value)}
        rows={4}
        placeholder="eyJhbGciOiJIUzI1NiIs..."
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-sm font-mono focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button onClick={decode} disabled={!token.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm">
          Декодировать
        </button>
        <button onClick={clear}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
          Очистить
        </button>
      </div>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      {header && (
        <div className="space-y-3">
          <div>
            <h2 className="font-semibold text-sm mb-1">Header</h2>
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto">{header}</pre>
          </div>
          <div>
            <h2 className="font-semibold text-sm mb-1">Payload</h2>
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-x-auto">{payload}</pre>
          </div>
          <div>
            <h2 className="font-semibold text-sm mb-1">Signature (truncated)</h2>
            <code className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded block">{sig}</code>
          </div>
          {(() => {
            try {
              const p = JSON.parse(payload)
              if (p.exp) {
                const expDate = new Date(p.exp * 1000)
                const now = Date.now()
                const diff = expDate.getTime() - now
                return (
                  <div className={`p-3 rounded-lg text-sm ${diff < 0 ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                    {diff < 0 ? 'Срок действия истёк' : `Истекает через ${Math.round(diff / 86400000)} дней`} ({expDate.toLocaleString('ru-RU')})
                  </div>
                )
              }
            } catch { /* ignore */ }
            return null
          })()}
        </div>
      )}
    </div>
  )
}
