import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  const info = {
    https: false,
    hsts: false,
    redirect: null as string | null,
    note: '',
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(target, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'SecHeaders/1.0' },
    })
    clearTimeout(timeout)

    if (res.status >= 300 && res.status < 400) {
      info.redirect = res.headers.get('location')
      info.note = 'Редирект на другую URL'
    }

    if (target.startsWith('https')) {
      info.https = true
      const hsts = res.headers.get('strict-transport-security')
      if (hsts) info.hsts = true
    }

    return NextResponse.json({ success: true, data: info })
  } catch {
    return NextResponse.json({ success: true, data: { ...info, note: 'Ошибка соединения' } })
  }
}
