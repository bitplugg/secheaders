import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const CHECK_PATHS = ['/favicon.ico', '/favicon.png', '/favicon.svg', '/apple-touch-icon.png', '/favicon-32x32.png', '/favicon-16x16.png']

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target
  const base = new URL(target).origin

  // Detect from HTML
  let htmlIcons: Array<{ rel: string; href: string; sizes?: string }> = []
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()
    const re = /<link[^>]*rel=["']([^"']*icon[^"']*)["'][^>]*/gi
    let m
    while ((m = re.exec(html)) !== null) {
      const tag = m[0]
      const hrefM = tag.match(/href=["']([^"']+)["']/i)
      const sizesM = tag.match(/sizes=["']([^"']+)["']/i)
      if (hrefM) {
        try {
          htmlIcons.push({ rel: m[1], href: new URL(hrefM[1], base).href, sizes: sizesM?.[1] })
        } catch { /* skip */ }
      }
    }
  } catch { /* ignore */ }

  // Check common favicon paths
  const results: Array<{ path: string; found: boolean; status: number | null; size?: number; type?: string }> = []
  const paths = htmlIcons.length > 0 ? htmlIcons.map(i => i.href) : CHECK_PATHS.map(p => base + p)

  for (const path of paths.slice(0, 10)) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      const res = await fetch(path, { method: 'HEAD', signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
      clearTimeout(timeout)
      const type = res.headers.get('content-type')
      const size = res.headers.get('content-length')
      results.push({ path, found: res.ok, status: res.status, size: size ? parseInt(size) : undefined, type: type || undefined })
    } catch {
      results.push({ path, found: false, status: null })
    }
  }

  return NextResponse.json({ success: true, data: { base, htmlIcons, results } })
}
