'use client'

import { useState, type FormEvent } from 'react'

interface ScanFormProps {
  onScan: (url: string) => void
  loading: boolean
  autoFocus?: boolean
}

export function ScanForm({ onScan, loading, autoFocus }: ScanFormProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (url.trim()) onScan(url.trim())
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text')
    if (text && (text.startsWith('http://') || text.startsWith('https://') || (text.includes('.') && !text.includes(' ')))) {
      setTimeout(() => { if (url.trim()) onScan(url.trim()) }, 30)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onPaste={handlePaste}
          placeholder="https://example.com"
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          disabled={loading}
          autoFocus={autoFocus}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg text-sm transition-colors"
        >
          {loading ? 'Сканирую...' : 'Сканировать'}
        </button>
      </div>
    </form>
  )
}
