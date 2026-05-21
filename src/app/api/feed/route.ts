import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const base = new URL(target).origin
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()

    const feeds: Array<{ type: string; title: string; href: string }> = []
    const re = /<link[^>]*type=["']application\/(rss|atom)\+xml["'][^>]*/gi
    let m
    while ((m = re.exec(html)) !== null) {
      const full = m[0]
      const titleM = full.match(/title=["']([^"']+)["']/i)
      const hrefM = full.match(/href=["']([^"']+)["']/i)
      if (hrefM) {
        try {
          feeds.push({
            type: m[1] === 'rss' ? 'RSS' : 'Atom',
            title: titleM ? titleM[1] : '(no title)',
            href: new URL(hrefM[1], base).href,
          })
        } catch { /* skip */ }
      }
    }

    // Also check common feed URLs
    const common = ['/feed', '/rss', '/feed.xml', '/rss.xml', '/atom.xml', '/feed/atom']
    for (const path of common) {
      try {
        const fc = new AbortController()
        const ft = setTimeout(() => fc.abort(), 3000)
        const fr = await fetch(base + path, { signal: fc.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
        clearTimeout(ft)
        if (fr.ok && (fr.headers.get('content-type') || '').includes('xml')) {
          const existing = feeds.some(f => f.href === base + path)
          if (!existing) {
            feeds.push({ type: 'Unknown', title: path, href: base + path })
          }
        }
      } catch { /* ignore */ }
    }

    return NextResponse.json({ success: true, data: { url: target, feeds } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
