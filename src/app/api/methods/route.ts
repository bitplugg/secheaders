import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target, {
      method: 'OPTIONS',
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'SecHeaders/1.0' },
    })
    clearTimeout(timeout)

    const allow = res.headers.get('allow')
    const accessControl = res.headers.get('access-control-allow-methods')
    const methods = allow || accessControl || null
    const parsed = methods ? methods.split(',').map(m => m.trim()).filter(Boolean) : []

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        status: res.status,
        methods: parsed,
        raw: methods,
        note: !methods ? 'Сервер не вернул Allow или Access-Control-Allow-Methods' : undefined,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
