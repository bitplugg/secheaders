import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const urlsParam = request.nextUrl.searchParams.get('urls')
  if (!urlsParam) return NextResponse.json({ success: false, error: 'urls required' }, { status: 400 })

  const urls = urlsParam.split(',').map(u => u.trim()).filter(Boolean).map(u => u.startsWith('http') ? u : 'https://' + u)

  if (urls.length > 10) return NextResponse.json({ success: false, error: 'Max 10 URLs' }, { status: 400 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (const [i, url] of urls.entries()) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', current: i + 1, total: urls.length, url })}\n\n`))
        try {
          const c = new AbortController()
          const t = setTimeout(() => c.abort(), 10000)
          const res = await fetch(url, { signal: c.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeadersSSE/1.0' } })
          clearTimeout(t)
          const headers: Record<string, string> = {}
          res.headers.forEach((v, k) => { const l = k.toLowerCase(); headers[l] = headers[l] ? headers[l] + ', ' + v : v })
          const { analyzeHeaders, gradeFromScore } = await import('@/lib/headers')
          const { checks, overallScore, maxScore } = analyzeHeaders(headers)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', url, status: res.status, overallScore, maxScore, grade: gradeFromScore(overallScore, maxScore) })}\n\n`))
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', url, error: err instanceof Error ? err.message : 'Failed' })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  })
}
