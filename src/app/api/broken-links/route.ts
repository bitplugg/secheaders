import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  const links: string[] = []
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()
    const base = new URL(target)
    const aRe = /<a[\s>][\s\S]*?href=["']([^"']+)["']/gi
    let m
    while ((m = aRe.exec(html)) !== null) {
      const href = m[1].trim()
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          links.push(new URL(href, target).href)
        } catch { /* skip invalid */ }
      }
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch page' }, { status: 500 })
  }

  const unique = [...new Set(links)].slice(0, 20)
  const results = await Promise.all(unique.map(async link => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(link, { method: 'HEAD', signal: controller.signal, redirect: 'manual', headers: { 'User-Agent': 'SecHeaders/1.0' } })
      clearTimeout(timeout)
      const location = res.headers.get('location')
      return { url: link, status: res.status, ok: res.status < 400, redirect: location }
    } catch {
      return { url: link, status: null, ok: false, redirect: null }
    }
  }))

  return NextResponse.json({
    success: true,
    data: {
      totalFound: unique.length,
      totalChecked: results.length,
      broken: results.filter(r => !r.ok).length,
      ok: results.filter(r => r.ok).length,
      links: results,
    },
  })
}
