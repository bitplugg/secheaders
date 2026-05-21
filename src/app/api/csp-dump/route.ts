import { NextRequest, NextResponse } from 'next/server'

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

    let cspHeader = ''
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-security-policy' || key.toLowerCase() === 'content-security-policy-report-only') {
        cspHeader = value
      }
    })

    if (!cspHeader) {
      return NextResponse.json({ success: true, data: null, message: 'CSP заголовок не найден' })
    }

    const directives: Record<string, string[]> = {}
    cspHeader.split(';').forEach(piece => {
      const parts = piece.trim().split(/\s+/)
      if (parts.length > 0) {
        const dir = parts[0].toLowerCase().replace(/^-/, '')
        directives[dir] = parts.slice(1)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        raw: cspHeader,
        directives,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
