import { NextRequest, NextResponse } from 'next/server'
import { analyzeHeaders, gradeFromScore } from '@/lib/headers'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ success: false, error: 'URL parameter is required' }, { status: 400 })
  }

  let targetUrl = url
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'SecurityHeadersChecker/1.0' },
    })

    clearTimeout(timeout)

    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (headers[lower]) {
        headers[lower] += ', ' + value
      } else {
        headers[lower] = value
      }
    })

    const { checks, overallScore, maxScore } = analyzeHeaders(headers)
    const grade = gradeFromScore(overallScore, maxScore)

    return NextResponse.json({
      success: true,
      data: {
        url: targetUrl,
        status: response.status,
        headers: checks,
        overallScore,
        maxScore,
        grade,
        timestamp: Date.now(),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
