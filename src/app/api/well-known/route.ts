import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const type = request.nextUrl.searchParams.get('type') || 'both'
  if (!url) return NextResponse.json({ success: false, error: 'URL required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target
  const base = new URL(target).origin

  const result: Record<string, { found: boolean; content: string | null; status: number | null; error?: string }> = {}

  const fetchFile = async (path: string) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`${base}${path}`, {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'SecHeaders/1.0' },
      })
      clearTimeout(timeout)
      const text = await res.text()
      return { found: res.ok, content: text.slice(0, 5000), status: res.status }
    } catch {
      return { found: false, content: null, status: null, error: 'Connection error' }
    }
  }

  if (type === 'both' || type === 'security') {
    result['security.txt'] = await fetchFile('/.well-known/security.txt')
  }
  if (type === 'both' || type === 'robots') {
    result['robots.txt'] = await fetchFile('/robots.txt')
  }

  return NextResponse.json({ success: true, data: { url: base, ...result } })
}
