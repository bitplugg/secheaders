import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const a = request.nextUrl.searchParams.get('a')
  const b = request.nextUrl.searchParams.get('b')
  if (!a || !b) return NextResponse.json({ success: false, error: 'Parameters a and b required' }, { status: 400 })

  const toUrl = (u: string) => u.startsWith('http') ? u : 'https://' + u

  const scanOne = async (url: string) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const headers: Record<string, string> = {}
    res.headers.forEach((v, k) => { const l = k.toLowerCase(); headers[l] = headers[l] ? headers[l] + ', ' + v : v })
    const { analyzeHeaders, gradeFromScore } = await import('@/lib/headers')
    const { checks, overallScore, maxScore } = analyzeHeaders(headers)
    return { url, status: res.status, checks, overallScore, maxScore, grade: gradeFromScore(overallScore, maxScore) }
  }

  try {
    const [resultA, resultB] = await Promise.all([scanOne(toUrl(a)), scanOne(toUrl(b))])
    return NextResponse.json({ success: true, data: { a: resultA, b: resultB } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Compare failed' }, { status: 500 })
  }
}
