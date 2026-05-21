import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

type MonitorEntry = {
  url: string
  status: 'ok' | 'warn' | 'error'
  grade: string
  responseTime: number
  checkedAt: string
  error?: string
}

export async function GET(request: NextRequest) {
  const urlsParam = request.nextUrl.searchParams.get('urls')
  if (!urlsParam) return NextResponse.json({ success: false, error: 'urls (comma-separated) required' }, { status: 400 })

  const urls = urlsParam.split(',').map(u => u.trim()).filter(Boolean)
  if (urls.length > 20) return NextResponse.json({ success: false, error: 'Max 20 URLs' }, { status: 400 })

  const results: MonitorEntry[] = []

  for (const url of urls) {
    const target = url.startsWith('http') ? url : 'https://' + url
    const start = Date.now()

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeadersMonitor/1.0' } })
      clearTimeout(timeout)

      const ms = Date.now() - start
      const hsts = res.headers.get('strict-transport-security')
      const csp = res.headers.get('content-security-policy')
      const score = (hsts ? 1 : 0) + (csp ? 1 : 0) + (target.startsWith('https') ? 1 : 0)
      const grade = score >= 3 ? 'A' : score >= 2 ? 'B' : score >= 1 ? 'D' : 'F'
      const status: MonitorEntry['status'] = res.ok ? 'ok' : res.status >= 400 ? 'error' : 'warn'

      results.push({ url: target, status, grade, responseTime: ms, checkedAt: new Date().toISOString() })
    } catch (err) {
      results.push({
        url: target, status: 'error', grade: 'F', responseTime: Date.now() - start,
        checkedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unreachable',
      })
    }
  }

  const ok = results.filter(r => r.status === 'ok').length
  const total = results.length

  return NextResponse.json({
    success: true,
    data: {
      results,
      summary: { ok, warn: total - ok - results.filter(r => r.status === 'error').length, error: results.filter(r => r.status === 'error').length, total },
      timestamp: Date.now(),
    },
  })
}
