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
    const res = await fetch(`${base}/sitemap.xml`, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'SecHeaders/1.0' },
    })
    clearTimeout(timeout)

    const text = await res.text()
    const urls: string[] = []
    const locRe = /<loc>([\s\S]*?)<\/loc>/gi
    let m
    while ((m = locRe.exec(text)) !== null) {
      urls.push(m[1].trim())
    }

    return NextResponse.json({
      success: true,
      data: {
        url: `${base}/sitemap.xml`,
        found: res.ok,
        status: res.status,
        urlCount: urls.length,
        urls: urls.slice(0, 100),
        contentType: res.headers.get('content-type'),
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
