import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const urlA = request.nextUrl.searchParams.get('urlA')
  const urlB = request.nextUrl.searchParams.get('urlB')
  if (!urlA || !urlB) return NextResponse.json({ success: false, error: 'urlA and urlB required' }, { status: 400 })

  const fetchInfo = async (u: string) => {
    let target = u
    if (!target.startsWith('http')) target = 'https://' + target
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
      clearTimeout(timeout)
      const headers: Record<string, string> = {}
      res.headers.forEach((v, k) => { headers[k] = v })
      const body = await res.text()
      return { url: target, status: res.status, headers, bodySize: body.length, error: null }
    } catch (err) {
      return { url: target, status: null, headers: {}, bodySize: null, error: err instanceof Error ? err.message : 'Failed' }
    }
  }

  const [a, b] = await Promise.all([fetchInfo(urlA), fetchInfo(urlB)])

  const headerDiff: Record<string, { a: string | null; b: string | null }> = {}
  const allKeys = new Set([...Object.keys(a.headers), ...Object.keys(b.headers)])
  for (const k of allKeys) {
    const ha = a.headers as Record<string, string>
    const hb = b.headers as Record<string, string>
    if (ha[k] !== hb[k]) {
      const lower = k.toLowerCase()
      if (!['cf-ray', 'x-request-id', 'x-amz-cf-id', 'x-timer', 'date'].includes(lower)) {
        headerDiff[k] = { a: ha[k] || null, b: hb[k] || null }
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      a: { url: a.url, status: a.status, bodySize: a.bodySize },
      b: { url: b.url, status: b.status, bodySize: b.bodySize },
      headerDiff,
      bodyDiff: a.bodySize !== b.bodySize ? { a: a.bodySize, b: b.bodySize } : null,
    },
  })
}
