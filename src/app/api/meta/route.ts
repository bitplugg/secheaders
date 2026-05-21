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

    const html = await res.text()
    const og: Record<string, string> = {}
    const twitter: Record<string, string> = {}
    const meta: Record<string, string> = {}

    const metaRe = /<meta[\s>][\s\S]*?\/?>/gi
    let match
    while ((match = metaRe.exec(html)) !== null) {
      const tag = match[0]
      const name = tag.match(/name\s*=\s*["']([^"']+)["']/)
      const property = tag.match(/property\s*=\s*["']([^"']+)["']/)
      const content = tag.match(/content\s*=\s*["']([^"']+)["']/)

      if (content) {
        const key = name?.[1] || property?.[1] || ''
        if (key.startsWith('og:')) og[key] = content[1]
        else if (key.startsWith('twitter:')) twitter[key] = content[1]
        else if (key && !key.startsWith('og:') && !key.startsWith('twitter:')) {
          meta[key] = content[1]
        }
      }
    }

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : null

    return NextResponse.json({
      success: true,
      data: { url: target, title, og, twitter, meta },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
