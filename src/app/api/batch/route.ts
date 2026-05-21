import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const urlsParam = request.nextUrl.searchParams.get('urls')
  if (!urlsParam) return NextResponse.json({ success: false, error: 'urls parameter required (comma-separated)' }, { status: 400 })

  const urls = urlsParam.split(',').map(u => {
    const t = u.trim()
    return t.startsWith('http') ? t : 'https://' + t
  })

  if (urls.length > 10) return NextResponse.json({ success: false, error: 'Maximum 10 URLs' }, { status: 400 })

  const results = await Promise.allSettled(urls.map(async url => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const headers: Record<string, string> = {}
    res.headers.forEach((v, k) => { const l = k.toLowerCase(); headers[l] = headers[l] ? headers[l] + ', ' + v : v })
    const { analyzeHeaders, gradeFromScore } = await import('@/lib/headers')
    const { checks, overallScore, maxScore } = analyzeHeaders(headers)
    const grade = gradeFromScore(overallScore, maxScore)
    return { url, status: res.status, overallScore, maxScore, grade, timestamp: Date.now() }
  }))

  const scanned = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return { url: urls[i], error: r.reason instanceof Error ? r.reason.message : 'Failed', status: 0, overallScore: 0, maxScore: 0, grade: 'N/A' }
  })

  return NextResponse.json({ success: true, data: { results: scanned, total: scanned.length } })
}
