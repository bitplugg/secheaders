import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const origin = request.nextUrl.searchParams.get('origin')
  if (!url) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const headers: Record<string, string> = { 'User-Agent': 'SecHeaders/1.0' }
    if (origin) headers['Origin'] = origin

    const res = await fetch(target, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers,
    })
    clearTimeout(timeout)

    const corsHeaders: Record<string, string> = {}
    const relevant = ['access-control-allow-origin', 'access-control-allow-methods',
      'access-control-allow-headers', 'access-control-allow-credentials',
      'access-control-expose-headers', 'access-control-max-age',
      'access-control-request-headers', 'access-control-request-method']
    res.headers.forEach((v, k) => {
      if (relevant.includes(k.toLowerCase())) corsHeaders[k] = v
    })

    const sentOrigin = origin || '* (не указан)'
    const allowedOrigin = res.headers.get('access-control-allow-origin')

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        status: res.status,
        sentOrigin,
        allowedOrigin,
        corsConfigured: Object.keys(corsHeaders).length > 0,
        headers: corsHeaders,
        verdict: allowedOrigin === '*'
          ? 'CRITICAL: CORS открыт для всех источников (*)'
          : allowedOrigin === sentOrigin || (allowedOrigin && sentOrigin !== '* (не указан)')
            ? 'CORS настроен для указанного источника'
            : !allowedOrigin
              ? 'CORS заголовки не найдены'
              : 'CORS настроен для другого источника',
      },
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    }, { status: 500 })
  }
}
