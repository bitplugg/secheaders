'use client'

import { useState } from 'react'

const SECTIONS = [
  {
    category: 'Scanning',
    endpoints: [
      {
        method: 'GET', path: '/api/scan', desc: 'Анализ HTTP-заголовков безопасности',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL сайта' }],
        curl: 'curl "https://secheaders.vercel.app/api/scan?url=https://example.com"',
        example: '{"success":true,"data":{"url":"https://example.com","grade":"A","overallScore":45,"maxScore":55}}',
      },
      {
        method: 'GET', path: '/api/ping', desc: 'Проверка доступности URL (HEAD)',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/ping?url=https://example.com"',
        example: '{"success":true,"data":{"reachable":true,"status":200,"ms":142}}',
      },
      {
        method: 'GET', path: '/api/mixed', desc: 'Поиск HTTP-ресурсов на HTTPS-странице',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/mixed?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/redirects', desc: 'Трассировка цепочки редиректов',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/redirects?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/gzip', desc: 'Проверка сжатия ответа',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/gzip?url=https://example.com"',
      },
    ],
  },
  {
    category: 'Security',
    endpoints: [
      {
        method: 'GET', path: '/api/csp-dump', desc: 'Разбор Content-Security-Policy',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/csp-dump?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/csp-eval', desc: 'Оценка безопасности директив CSP',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/csp-eval?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/ssl', desc: 'Проверка HTTPS/HSTS',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/ssl?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/tls', desc: 'HTTP/2, HTTP/3, Alt-Svc',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/tls?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/cors', desc: 'Анализ CORS-заголовков',
        params: [
          { name: 'url', type: 'string', required: true, desc: 'URL' },
          { name: 'origin', type: 'string', required: false, desc: 'Origin для запроса' },
        ],
        curl: 'curl "https://secheaders.vercel.app/api/cors?url=https://api.example.com&origin=https://mysite.com"',
      },
      {
        method: 'GET', path: '/api/cookies', desc: 'Детальный анализ Set-Cookie',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/cookies?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/ssrf', desc: 'SSRF тест',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/ssrf?url=https://example.com"',
      },
    ],
  },
  {
    category: 'DNS & Domains',
    endpoints: [
      {
        method: 'GET', path: '/api/dns', desc: 'DNS-записи через Cloudflare DoH',
        params: [
          { name: 'domain', type: 'string', required: true, desc: 'Домен' },
          { name: 'types', type: 'string', required: false, desc: 'Типы записей (A,AAAA,MX,TXT)' },
        ],
        curl: 'curl "https://secheaders.vercel.app/api/dns?domain=example.com&types=A,AAAA,MX"',
      },
      {
        method: 'GET', path: '/api/whois', desc: 'RDAP данные домена',
        params: [{ name: 'domain', type: 'string', required: true, desc: 'Домен' }],
        curl: 'curl "https://secheaders.vercel.app/api/whois?domain=example.com"',
      },
      {
        method: 'GET', path: '/api/email-security', desc: 'SPF/DKIM/DMARC',
        params: [{ name: 'domain', type: 'string', required: true, desc: 'Домен' }],
        curl: 'curl "https://secheaders.vercel.app/api/email-security?domain=example.com"',
      },
      {
        method: 'GET', path: '/api/subdomains', desc: 'Поиск поддоменов через crt.sh',
        params: [{ name: 'domain', type: 'string', required: true, desc: 'Домен' }],
        curl: 'curl "https://secheaders.vercel.app/api/subdomains?domain=example.com"',
      },
    ],
  },
  {
    category: 'Infrastructure',
    endpoints: [
      {
        method: 'GET', path: '/api/server', desc: 'Определение серверного ПО по заголовкам',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/server?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/cdn', desc: 'Определение CDN',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/cdn?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/pwa', desc: 'PWA-валидация',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/pwa?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/deps', desc: 'Определение JS-библиотек и CMS',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/deps?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/wp', desc: 'WordPress сканер',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/wp?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/methods', desc: 'OPTIONS запрос, список HTTP методов',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/methods?url=https://example.com"',
      },
    ],
  },
  {
    category: 'Content',
    endpoints: [
      {
        method: 'GET', path: '/api/page-info', desc: 'Метаданные страницы',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/page-info?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/meta', desc: 'OG/Twitter/meta теги',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/meta?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/schema', desc: 'JSON-LD структурированные данные',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/schema?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/preview', desc: 'Open Graph превью ссылки',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/preview?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/sitemap', desc: 'Проверка sitemap.xml',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/sitemap?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/feed', desc: 'Поиск RSS/Atom лент',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/feed?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/favicon', desc: 'Проверка иконок',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/favicon?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/prefetch', desc: 'Поиск preload/prefetch ресурсов',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/prefetch?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/broken-links', desc: 'Поиск битых ссылок',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/broken-links?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/well-known', desc: 'security.txt / robots.txt',
        params: [
          { name: 'url', type: 'string', required: true, desc: 'URL' },
          { name: 'type', type: 'string', required: false, desc: 'security / robots / both' },
        ],
        curl: 'curl "https://secheaders.vercel.app/api/well-known?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/validator', desc: 'W3C HTML валидатор',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/validator?url=https://example.com"',
      },
      {
        method: 'GET', path: '/api/sri', desc: 'SRI Checker (integrity атрибуты)',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/sri?url=https://example.com"',
      },
    ],
  },
  {
    category: 'Comparison & Diff',
    endpoints: [
      {
        method: 'GET', path: '/api/diff', desc: 'Сравнение заголовков двух URL',
        params: [
          { name: 'urlA', type: 'string', required: true, desc: 'Первый URL' },
          { name: 'urlB', type: 'string', required: true, desc: 'Второй URL' },
        ],
        curl: 'curl "https://secheaders.vercel.app/api/diff?urlA=https://site1.com&urlB=https://site2.com"',
      },
      {
        method: 'GET', path: '/api/clone', desc: 'Получение заголовков для сравнения клонов',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/clone?url=https://example.com"',
      },
    ],
  },
  {
    category: 'Misc',
    endpoints: [
      {
        method: 'GET', path: '/api/wayback', desc: 'Проверка archive.org',
        params: [{ name: 'url', type: 'string', required: true, desc: 'URL' }],
        curl: 'curl "https://secheaders.vercel.app/api/wayback?url=https://example.com"',
      },
    ],
  },
]

export default function DocsPage() {
  const [liveUrl, setLiveUrl] = useState('https://example.com')
  const [liveResult, setLiveResult] = useState<string | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(SECTIONS[0].category)

  const testAPI = async (path: string) => {
    setLiveLoading(true); setLiveResult(null)
    try {
      const res = await fetch(`${path}?url=${encodeURIComponent(liveUrl)}`)
      const text = await res.text()
      setLiveResult(JSON.stringify(JSON.parse(text), null, 2))
    } catch {
      setLiveResult('Ошибка запроса')
    } finally { setLiveLoading(false) }
  }

  return (
    <div className="max-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
      <p className="text-gray-500">Все эндпоинты работают на Vercel Edge Runtime. 37 API методов.</p>

      <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">Live API Tester</h2>
        <div className="flex gap-2 flex-wrap">
          <input type="text" value={liveUrl} onChange={e => setLiveUrl(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500" />
          <select value={activeTab} onChange={e => setActiveTab(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
            {SECTIONS.map(s => <option key={s.category} value={s.category}>{s.category}</option>)}
          </select>
          <button onClick={() => {
            const sec = SECTIONS.find(s => s.category === activeTab)
            if (sec) testAPI(sec.endpoints[0].path)
          }} disabled={liveLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm">
            {liveLoading ? '...' : 'Test'}
          </button>
        </div>
        {liveResult && <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded max-h-60 overflow-x-auto">{liveResult}</pre>}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {SECTIONS.map(s => (
          <button key={s.category} onClick={() => setActiveTab(s.category)}
            className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition ${activeTab === s.category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-400'}`}>
            {s.category} ({s.endpoints.length})
          </button>
        ))}
      </div>

      {SECTIONS.filter(s => s.category === activeTab).map(section => (
        <div key={section.category} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.category}</h2>
          {section.endpoints.map(ep => (
            <div key={ep.path} id={ep.path} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 mr-2">{ep.method}</span>
                  <code className="text-sm font-mono">{ep.path}</code>
                </div>
                <button onClick={() => testAPI(ep.path)}
                  className="text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Test</button>
              </div>
              <p className="text-sm text-gray-500">{ep.desc}</p>
              {ep.params.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Parameters:</p>
                  {ep.params.map(p => (
                    <div key={p.name} className="text-xs flex gap-2">
                      <code className="font-mono">{p.name}</code>
                      <span className="text-gray-400">{p.type}</span>
                      {p.required && <span className="text-red-500">required</span>}
                      <span className="text-gray-500">{p.desc}</span>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">cURL:</p>
                <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">{ep.curl}</pre>
              </div>
              {ep.example && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Response:</p>
                  <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">{ep.example}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
