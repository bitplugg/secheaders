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
    const start = performance.now()
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const loadMs = Math.round(performance.now() - start)
    const text = await res.text()
    const sizeBytes = new TextEncoder().encode(text).length

    const favicon = (() => {
      const m = text.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
      return m ? m[1] : null
    })()

    const lang = (() => {
      const m = text.match(/<html[^>]*lang=["']([^"']+)["']/i)
      return m ? m[1] : null
    })()

    const charset = (() => {
      const m = text.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i)
      return m ? m[1] : null
    })()

    const viewport = (() => {
      const m = text.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i)
      return m ? m[1] : null
    })()

    const canonical = (() => {
      const m = text.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
      return m ? m[1] : null
    })()

    const hreflangs: Array<{ lang: string; href: string }> = []
    const hlRe = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi
    let m
    while ((m = hlRe.exec(text)) !== null) {
      hreflangs.push({ lang: m[1], href: m[2] })
    }

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        status: res.status,
        sizeBytes,
        loadMs,
        contentType: res.headers.get('content-type'),
        lastModified: res.headers.get('last-modified'),
        etag: res.headers.get('etag'),
        favicon,
        lang,
        charset,
        viewport,
        canonical,
        hreflangs,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
