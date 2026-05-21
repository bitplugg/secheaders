import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const start = performance.now()
    const res = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'SecHeaders/1.0' },
    })
    clearTimeout(timeout)

    return NextResponse.json({
      success: true,
      data: {
        reachable: true,
        status: res.status,
        redirected: res.headers.get('location') || null,
        ms: Math.round(performance.now() - start),
      },
    })
  } catch {
    return NextResponse.json({
      success: true,
      data: { reachable: false, status: null, redirected: null, ms: null },
    })
  }
}
