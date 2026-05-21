import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  const chain: Array<{ url: string; status: number; location: string | null }> = []
  let maxSteps = 10

  try {
    while (maxSteps-- > 0) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(target, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'SecHeaders/1.0' },
      })
      clearTimeout(timeout)

      const location = res.headers.get('location')
      chain.push({ url: target, status: res.status, location })

      if (res.status < 300 || res.status >= 400 || !location) break
      target = new URL(location, target).href
    }

    return NextResponse.json({
      success: true,
      data: {
        start: url,
        steps: chain,
        count: chain.length,
        final: chain[chain.length - 1]?.url,
        loop: maxSteps < 0,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
