import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const info: Record<string, any> = { https: target.startsWith('https://') }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    const altSvc = res.headers.get('alt-svc')
    if (altSvc) {
      info.altSvc = altSvc
      if (altSvc.includes('h2')) info.http2 = true
      if (altSvc.includes('h3')) info.http3 = true
    }
    info.hsts = !!res.headers.get('strict-transport-security')
    info.status = res.status

    // Check TLS via external helper
    try {
      const hostname = new URL(target).hostname
      const tlsc = new AbortController()
      const tlst = setTimeout(() => tlsc.abort(), 5000)
      const tlsRes = await fetch(`https://${hostname}`, { method: 'HEAD', signal: tlsc.signal, headers: { 'User-Agent': 'SecHeaders/1.0' } })
      clearTimeout(tlst)
      info.tlsConnected = true
      info.tlsVersion = tlsRes.headers.get('x-forwarded-proto') || 'unknown (behind proxy)'
    } catch {
      info.tlsConnected = false
    }

    return NextResponse.json({ success: true, data: info })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
