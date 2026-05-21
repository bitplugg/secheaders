import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'SecHeaders/1.0' },
    })
    clearTimeout(timeout)

    const rawCookies = res.headers.get('set-cookie')
    if (!rawCookies) {
      return NextResponse.json({ success: true, data: { url: target, total: 0, cookies: [] } })
    }

    const cookies = rawCookies.split(/\n|,\s*(?![^\;]*\;)/).filter(Boolean).map(c => {
      const parts = c.split(';').map(p => p.trim())
      const nv = parts[0].split('=')
      const name = nv[0]
      const value = nv.slice(1).join('=')
      const attrs: Record<string, string> = {}
      for (let i = 1; i < parts.length; i++) {
        const eq = parts[i].indexOf('=')
        if (eq > 0) {
          attrs[parts[i].slice(0, eq).trim().toLowerCase()] = parts[i].slice(eq + 1).trim()
        } else {
          attrs[parts[i].trim().toLowerCase()] = 'true'
        }
      }
      return { name, value: value.slice(0, 50), attrs }
    })

    const secure = cookies.filter(c => c.attrs.secure).length
    const httpOnly = cookies.filter(c => c.attrs.httponly).length
    const sameSite = cookies.filter(c => c.attrs.samesite).length

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        total: cookies.length,
        secure,
        httpOnly,
        sameSite,
        none: cookies.length - secure,
        cookies,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
