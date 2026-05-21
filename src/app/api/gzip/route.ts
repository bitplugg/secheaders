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
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    const encoding = res.headers.get('content-encoding')
    const text = await res.text()
    const rawSize = new TextEncoder().encode(text).length
    const contentLength = res.headers.get('content-length')
    const compressed = encoding && ['gzip', 'br', 'deflate', 'zstd'].includes(encoding.toLowerCase())

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        compressed: !!compressed,
        encoding: compressed ? encoding : null,
        contentLength: contentLength ? parseInt(contentLength) : null,
        rawSize,
        ratio: contentLength && rawSize > 0 ? `${Math.round((1 - parseInt(contentLength) / rawSize) * 100)}%` : null,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
