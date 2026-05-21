import { MetadataRoute } from 'next'

const BASE = 'https://zxc-r1spclf9a-bitplugg.vercel.app'

const pages = [
  '', '/tools', '/monitor', '/report', '/batch', '/compare', '/mixed', '/redirects', '/gzip',
  '/csp', '/csp-eval', '/ssl', '/tls', '/cors', '/cookies', '/dns', '/whois', '/email-security',
  '/subdomains', '/sri', '/sri-gen', '/server', '/page-info', '/schema', '/social-preview',
  '/preview', '/meta', '/sitemap', '/methods', '/broken-links', '/feed', '/favicon', '/cdn',
  '/pwa', '/deps', '/clone', '/ssrf', '/wp', '/contrast', '/validator', '/wayback', '/diff',
  '/jwt', '/well-known', '/history', '/history-chart', '/pretty', '/encode', '/hash',
  '/api-docs', '/docs',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(path => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/tools' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : path === '/tools' ? 0.9 : 0.6,
  }))
}
