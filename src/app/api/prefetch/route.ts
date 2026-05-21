import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()

    const links: Array<{ rel: string; href: string | null; as?: string; type?: string }> = []
    const re = /<link[\s>][\s\S]*?\/?>/gi
    let m
    while ((m = re.exec(html)) !== null) {
      const tag = m[0]
      const rel = tag.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1] || ''
      const prefetchRels = ['prefetch', 'preload', 'preconnect', 'dns-prefetch', 'prefetch', 'prerender', 'modulepreload']
      if (prefetchRels.includes(rel)) {
        links.push({
          rel,
          href: tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] || null,
          as: tag.match(/as\s*=\s*["']([^"']+)["']/i)?.[1],
          type: tag.match(/type\s*=\s*["']([^"']+)["']/i)?.[1],
        })
      }
    }

    return NextResponse.json({ success: true, data: { url: target, total: links.length, links } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
