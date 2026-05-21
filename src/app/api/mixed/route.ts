import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const HTTP_RE = /(?:src|href)\s*=\s*["']http:\/\/([^"']+)["']/gi

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target
  const isHTTPS = target.startsWith('https://')

  if (!isHTTPS) return NextResponse.json({ success: true, data: { note: 'Mixed content актуален только для HTTPS' } })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    const html = await res.text()
    const matches: string[] = []
    let match
    while ((match = HTTP_RE.exec(html)) !== null) {
      matches.push(`http://${match[1]}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        total: matches.length,
        resources: [...new Set(matches)].sort(),
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
