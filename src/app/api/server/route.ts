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

    const info: Record<string, string> = {}
    const interesting = ['server', 'x-powered-by', 'x-aspnet-version',
      'x-aspnetmvc-version', 'x-runtime', 'via', 'x-varnish',
      'cf-ray', 'x-served-by', 'x-forwarded-for', 'x-real-ip',
      'x-cache', 'age', 'x-frame-options', 'x-xss-protection',
      'set-cookie', 'alt-svc']

    res.headers.forEach((v, k) => {
      const lower = k.toLowerCase()
      if (interesting.includes(lower) || lower.startsWith('x-')) {
        info[k] = v
      }
    })

    const body = await res.text()
    const generators: string[] = []
    const genMatch = body.match(/<meta\s+name=["']generator["'][\s\S]*?content=["']([^"']+)["']/i)
    if (genMatch) generators.push(genMatch[1])

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        status: res.status,
        headers: info,
        generators,
      },
    })
  } catch (err) {
    return NextResponse.json({
      success: false, error: err instanceof Error ? err.message : 'Failed',
    }, { status: 500 })
  }
}
