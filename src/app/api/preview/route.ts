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

    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null
    const desc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const ogSite = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const twTitle = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const twDesc = html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const twImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || null
    const icon = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)?.[1] || null

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        title: ogTitle || twTitle || title,
        description: ogDesc || twDesc || desc,
        image: ogImage || twImage || null,
        siteName: ogSite || new URL(target).hostname,
        icon: icon || `${new URL(target).origin}/favicon.ico`,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
