import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const CDN_PATTERNS: Array<{ name: string; headers: string[]; serverPattern?: RegExp }> = [
  { name: 'Cloudflare', headers: ['cf-ray', 'cf-cache-status', 'cf-edge-cache'] },
  { name: 'Fastly', headers: ['x-fastly-request-id', 'x-served-by', 'x-cache-hits', 'x-timer'] },
  { name: 'Akamai', headers: ['x-akamai-request-id', 'x-akamai-transformed'] },
  { name: 'Amazon CloudFront', headers: ['x-amz-cf-id', 'x-amz-cf-pop', 'x-edge-location'] },
  { name: 'AWS S3', headers: ['x-amz-request-id', 'x-amz-id-2'] },
  { name: 'Vercel', headers: ['x-vercel-id', 'x-vercel-cache'] },
  { name: 'Netlify', headers: ['x-nf-request-id', 'server'] },
  { name: 'GitHub Pages', headers: ['x-github-request-id'] },
  { name: 'nginx', headers: ['server'] },
  { name: 'Apache', headers: ['server'] },
  { name: 'CloudFlare (Server)', headers: ['server'] },
  { name: 'Varnish', headers: ['x-varnish', 'via'] },
]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    const detected: string[] = []
    const server = res.headers.get('server') || ''

    for (const cdn of CDN_PATTERNS) {
      const matches = cdn.headers.filter(h => res.headers.get(h))
      if (matches.length > 0) {
        if (cdn.serverPattern && cdn.serverPattern.test(server)) {
          if (!detected.includes(cdn.name)) detected.push(cdn.name)
        } else if (!cdn.serverPattern) {
          if (!detected.includes(cdn.name)) detected.push(cdn.name)
        }
      }
    }

    const headers: Record<string, string> = {}
    res.headers.forEach((v, k) => {
      const lower = k.toLowerCase()
      if (lower.startsWith('cf-') || lower.startsWith('x-') || ['server', 'via'].includes(lower)) {
        headers[k] = v
      }
    })

    return NextResponse.json({ success: true, data: { url: target, detected, headers } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
