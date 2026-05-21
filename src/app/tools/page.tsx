'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { ScanResult, HistoryItem } from '@/lib/types'
import { ScanForm } from '@/components/ScanForm'
import { ScoreBadge, ScoreBar } from '@/components/ScoreBadge'
import { ResultCard } from '@/components/ResultCard'
import { ExportButtons } from '@/components/ExportButtons'
import { SkeletonResult } from '@/components/Skeleton'
import { SearchTools } from '@/components/SearchTools'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { useToast } from '@/components/Toast'

function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try { const raw = localStorage.getItem('secheaders_history'); return raw ? JSON.parse(raw) : [] }
  catch { return [] }
}

function addToHistory(item: HistoryItem) {
  try {
    const history = getHistory()
    history.unshift(item)
    localStorage.setItem('secheaders_history', JSON.stringify(history.slice(0, 20)))
  } catch { /* ignore */ }
}

const EXAMPLES = [
  { label: 'google.com', url: 'https://google.com' },
  { label: 'github.com', url: 'https://github.com' },
  { label: 'vercel.com', url: 'https://vercel.com' },
  { label: 'habr.com', url: 'https://habr.com' },
]

const ALL_TOOLS = [
  { href: '/batch', label: 'Batch Scan', desc: 'Массовое сканирование', icon: '📋' },
  { href: '/compare', label: 'Compare', desc: 'Сравнение двух сайтов', icon: '⚖️' },
  { href: '/mixed', label: 'Mixed Content', desc: 'HTTP ресурсы на HTTPS', icon: '⚠️' },
  { href: '/redirects', label: 'Redirects', desc: 'Цепочка редиректов', icon: '↪️' },
  { href: '/gzip', label: 'GZIP Checker', desc: 'Проверка сжатия', icon: '📦' },
  { href: '/csp', label: 'CSP Analyzer', desc: 'Content-Security-Policy', icon: '🔒' },
  { href: '/csp-eval', label: 'CSP Evaluator', desc: 'Безопасность директив', icon: '🔍' },
  { href: '/ssl', label: 'SSL Checker', desc: 'HTTPS и HSTS', icon: '🔐' },
  { href: '/tls', label: 'TLS Checker', desc: 'HTTP/2, HTTP/3', icon: '🔏' },
  { href: '/cors', label: 'CORS Tester', desc: 'CORS-заголовки', icon: '🌐' },
  { href: '/cookies', label: 'Cookies', desc: 'Set-Cookie анализ', icon: '🍪' },
  { href: '/dns', label: 'DNS Checker', desc: 'A/AAAA/MX/TXT/NS', icon: '📡' },
  { href: '/whois', label: 'WHOIS', desc: 'RDAP данные домена', icon: '📋' },
  { href: '/email-security', label: 'Email', desc: 'SPF/DKIM/DMARC', icon: '📧' },
  { href: '/cdn', label: 'CDN Detector', desc: 'Cloudflare/Fastly', icon: '🌍' },
  { href: '/pwa', label: 'PWA Validator', desc: 'Manifest/SW', icon: '📱' },
  { href: '/subdomains', label: 'Subdomains', desc: 'Поиск через crt.sh', icon: '🔍' },
  { href: '/sri', label: 'SRI Checker', desc: 'Subresource Integrity', icon: '✅' },
  { href: '/sri-gen', label: 'SRI Generator', desc: 'Генерация хеша', icon: '🔑' },
  { href: '/server', label: 'Server', desc: 'Серверное ПО', icon: '🖥️' },
  { href: '/page-info', label: 'Page Info', desc: 'Метаданные', icon: 'ℹ️' },
  { href: '/schema', label: 'Schema', desc: 'JSON-LD структура', icon: '📊' },
  { href: '/social-preview', label: 'Social', desc: 'Превью соцсетей', icon: '👁️' },
  { href: '/preview', label: 'Link Preview', desc: 'Превью ссылки', icon: '🔗' },
  { href: '/meta', label: 'Meta Tags', desc: 'OG/Twitter/meta', icon: '🏷️' },
  { href: '/sitemap', label: 'Sitemap', desc: 'sitemap.xml', icon: '🗺️' },
  { href: '/methods', label: 'Methods', desc: 'HTTP методы', icon: '🔧' },
  { href: '/broken-links', label: 'Links', desc: 'Битые ссылки', icon: '🔗' },
  { href: '/feed', label: 'Feeds', desc: 'RSS/Atom', icon: '📢' },
  { href: '/favicon', label: 'Favicon', desc: 'Иконки сайта', icon: '🖼️' },
  { href: '/deps', label: 'Deps', desc: 'JS-библиотеки/CMS', icon: '📦' },
  { href: '/clone', label: 'Clone Detector', desc: 'Поиск клонов', icon: '🪞' },
  { href: '/ssrf', label: 'SSRF Checker', desc: 'Server-Side RF', icon: '🛡️' },
  { href: '/wp', label: 'WP Scanner', desc: 'WordPress сканер', icon: '🔌' },
  { href: '/contrast', label: 'Contrast', desc: 'WCAG контрастность', icon: '👁️' },
  { href: '/validator', label: 'HTML Validator', desc: 'W3C валидатор', icon: '✅' },
  { href: '/wayback', label: 'Wayback', desc: 'archive.org', icon: '🕰️' },
  { href: '/diff', label: 'HTTP Diff', desc: 'Сравнить ответы', icon: '📊' },
  { href: '/jwt', label: 'JWT Decoder', desc: 'Декодирование', icon: '🧩' },
  { href: '/well-known', label: '.well-known', desc: 'security.txt', icon: '📄' },
  { href: '/history', label: 'History', desc: 'История', icon: '🕐' },
  { href: '/history-chart', label: 'Chart', desc: 'График оценок', icon: '📈' },
  { href: '/pretty', label: 'Pretty Print', desc: 'JSON/XML', icon: '🎨' },
  { href: '/encode', label: 'Encode', desc: 'Base64/URL', icon: '🔤' },
  { href: '/hash', label: 'Hash', desc: 'SHA-1/256/384/512', icon: '🔑' },
  { href: '/docs', label: 'API Docs', desc: 'Документация', icon: '📖' },
]

const CATEGORIES = [
  { name: 'Scanning & Headers', icon: '🔍', tools: ALL_TOOLS.slice(0, 5) },
  { name: 'Security', icon: '🛡️', tools: ALL_TOOLS.slice(5, 12) },
  { name: 'DNS & Domains', icon: '🌐', tools: ALL_TOOLS.slice(12, 16) },
  { name: 'Infrastructure', icon: '🏗️', tools: ALL_TOOLS.slice(16, 22) },
  { name: 'Content & SEO', icon: '📄', tools: ALL_TOOLS.slice(22, 32) },
  { name: 'Utilities', icon: '🧰', tools: ALL_TOOLS.slice(32) },
]

export default function ToolsPage() {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pingStatus, setPingStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setHistory(getHistory().slice(0, 5))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const report = params.get('report')
    if (report) {
      try { const p = JSON.parse(decodeURIComponent(atob(report))); if (p.url) handleScan(p.url) }
      catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (!loading) { setProgress(0); return }
    const interval = setInterval(() => setProgress(p => Math.min(p + 15, 90)), 500)
    return () => clearInterval(interval)
  }, [loading])

  const handleScan = useCallback(async (url: string) => {
    setLoading(true); setError(null); setResult(null); setPingStatus(null)
    try {
      const pingRes = await fetch(`/api/ping?url=${encodeURIComponent(url)}`)
      const pingJson = await pingRes.json()
      if (pingJson.success && pingJson.data) {
        if (!pingJson.data.reachable) { setError('Сайт недоступен'); setLoading(false); return }
        setPingStatus(`OK (${pingJson.data.status}, ${pingJson.data.ms}ms)`)
      }
      setProgress(50)
      const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (!json.success) { setError(json.error || 'Ошибка'); setLoading(false); return }
      setProgress(100); setResult(json.data)
      addToHistory({ url: json.data.url, grade: json.data.grade, timestamp: json.data.timestamp })
      setHistory(getHistory().slice(0, 5))
      toast('Сканирование завершено', 'success')
    } catch (err) { setError(err instanceof Error ? err.message : 'Network error') }
    finally { setLoading(false) }
  }, [toast])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs />

      <div className="text-center space-y-3 py-4 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Инструменты</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Введите URL для сканирования заголовков или выберите инструмент из категорий ниже.
        </p>
      </div>

      <ScanForm onScan={handleScan} loading={loading} autoFocus />

      {loading && (
        <div className="max-w-xl mx-auto space-y-2 animate-fade-in">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="h-2 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 text-center">Сканирование... {progress}%</p>
        </div>
      )}

      {loading && !result && <SkeletonResult />}

      {error && (
        <div className="max-w-xl mx-auto p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg text-sm text-red-700 animate-scale-in">{error}</div>
      )}

      {result && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white dark:bg-gray-900 border rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <ScoreBadge grade={result.grade} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{result.url}</p>
                <p className="text-sm text-gray-500">HTTP {result.status}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">Score</p>
                <p className="font-bold text-lg">{result.overallScore}/{result.maxScore}</p>
              </div>
            </div>
            <ScoreBar score={result.overallScore} maxScore={result.maxScore} />
            <div className="mt-4"><ExportButtons result={result} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.headers.map(h => <ResultCard key={h.name} check={h} />)}
          </div>
        </div>
      )}

      {!result && (
        <div className="space-y-2 animate-fade-in">
          <SearchTools tools={ALL_TOOLS} />
        </div>
      )}

      {!result && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {EXAMPLES.map(ex => (
              <button key={ex.label} onClick={() => handleScan(ex.url)}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                {ex.label}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="max-w-md mx-auto mb-6 space-y-1">
              <p className="text-xs text-gray-400 text-center mb-2">Последние сканирования</p>
              {history.map((h, i) => (
                <button key={i} onClick={() => handleScan(h.url)}
                  className="flex items-center gap-2 w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs hover:border-blue-400 transition">
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${h.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : h.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{h.grade}</span>
                  <code className="truncate">{h.url}</code>
                  <span className="text-gray-400 ml-auto">{new Date(h.timestamp).toLocaleDateString('ru-RU')}</span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {CATEGORIES.map(cat => (
              <section key={cat.name} className="animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <span>{cat.icon}</span>
                  <h2 className="text-lg font-semibold">{cat.name}</h2>
                  <span className="text-xs text-gray-400">{cat.tools.length}</span>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {cat.tools.map(tool => (
                    <a key={tool.href} href={tool.href}
                      className="card-hover block p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="text-xl mb-1">{tool.icon}</div>
                      <h3 className="font-semibold text-xs mb-0.5">{tool.label}</h3>
                      <p className="text-[10px] text-gray-500">{tool.desc}</p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
