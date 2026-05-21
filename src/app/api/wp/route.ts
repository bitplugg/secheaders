import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const WP_PATHS = [
  { path: '/wp-admin/', label: 'wp-admin' },
  { path: '/wp-content/', label: 'wp-content' },
  { path: '/wp-includes/', label: 'wp-includes' },
  { path: '/wp-json/', label: 'REST API' },
  { path: '/wp-login.php', label: 'wp-login' },
  { path: '/xmlrpc.php', label: 'XML-RPC' },
  { path: '/readme.html', label: 'readme.html' },
  { path: '/wp-content/plugins/', label: 'Plugins dir' },
  { path: '/wp-content/themes/', label: 'Themes dir' },
  { path: '/wp-content/uploads/', label: 'Uploads dir' },
  { path: '/wp-admin/admin-ajax.php', label: 'admin-ajax' },
  { path: '/?author=1', label: 'Author enum' },
  { path: '/wp-json/wp/v2/users/', label: 'Users API' },
]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target
  const base = new URL(target).origin

  const results: Array<{ path: string; label: string; found: boolean; status: number | null }> = []

  for (const p of WP_PATHS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      const res = await fetch(base + p.path, { method: 'HEAD', signal: controller.signal, redirect: 'manual', headers: { 'User-Agent': 'SecHeaders/1.0' } })
      clearTimeout(timeout)
      results.push({ path: p.path, label: p.label, found: res.status < 400 || res.status === 403 || res.status === 302, status: res.status })
    } catch {
      results.push({ path: p.path, label: p.label, found: false, status: null })
    }
  }

  const wpFound = results.filter(r => r.found).length
  const isWP = wpFound >= 3

  // Try to detect version from readme.html
  let version: string | null = null
  if (results.find(r => r.path === '/readme.html')?.found) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      const res = await fetch(base + '/readme.html', { signal: controller.signal, headers: { 'User-Agent': 'SecHeaders/1.0' } })
      clearTimeout(timeout)
      const text = await res.text()
      const v = text.match(/Version\s+(\d+\.\d+(?:\.\d+)?)/i)
      if (v) version = v[1]
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    success: true,
    data: { url: base, isWP, confidence: `${Math.round((wpFound / WP_PATHS.length) * 100)}%`, version, found: wpFound, total: WP_PATHS.length, results },
  })
}
