'use client'

import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  '': 'Home',
  'batch': 'Batch Scan', 'compare': 'Compare', 'mixed': 'Mixed Content',
  'redirects': 'Redirects', 'gzip': 'GZIP Checker',
  'csp': 'CSP Analyzer', 'csp-eval': 'CSP Evaluator',
  'ssl': 'SSL Checker', 'tls': 'TLS Checker',
  'cors': 'CORS Tester', 'cookies': 'Cookie Inspector',
  'dns': 'DNS Checker', 'whois': 'WHOIS Lookup',
  'email-security': 'Email Security', 'subdomains': 'Subdomains',
  'sri': 'SRI Checker', 'sri-gen': 'SRI Generator',
  'server': 'Server Info', 'page-info': 'Page Info',
  'schema': 'Schema Analyzer', 'social-preview': 'Social Preview',
  'preview': 'Link Preview', 'meta': 'Meta Tags',
  'sitemap': 'Sitemap', 'methods': 'HTTP Methods',
  'broken-links': 'Broken Links', 'feed': 'Feeds',
  'favicon': 'Favicon', 'cdn': 'CDN Detector',
  'pwa': 'PWA Validator', 'deps': 'Dependency Detector',
  'clone': 'Clone Detector', 'ssrf': 'SSRF Checker',
  'wp': 'WP Scanner', 'contrast': 'Contrast',
  'validator': 'HTML Validator', 'wayback': 'Wayback',
  'diff': 'HTTP Diff', 'jwt': 'JWT Decoder',
  'well-known': '.well-known', 'history': 'History',
  'history-chart': 'Score Chart',
  'pretty': 'Pretty Print', 'encode': 'Encode/Decode',
  'hash': 'Hash Generator', 'docs': 'API Docs',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  return (
    <nav className="max-w-6xl mx-auto px-4 pt-4 pb-0 text-xs text-gray-400 flex items-center gap-1" aria-label="Breadcrumb">
      <a href="/" className="hover:text-blue-600 transition">Home</a>
      {segments.map((seg, i) => (
        <span key={seg} className="flex items-center gap-1">
          <span>/</span>
          <span className={i === segments.length - 1 ? 'text-gray-600 dark:text-gray-300 font-medium' : 'hover:text-blue-600 transition'}>
            {i === segments.length - 1 ? (LABELS[seg] || seg) : <a href={`/${segments.slice(0, i + 1).join('/')}`} className="hover:text-blue-600 transition">{LABELS[seg] || seg}</a>}
          </span>
        </span>
      ))}
    </nav>
  )
}
