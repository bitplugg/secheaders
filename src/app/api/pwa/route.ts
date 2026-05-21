import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target
  const base = new URL(target).origin

  const result: Record<string, any> = {}

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()

    // manifest.json
    const manM = html.match(/<link[^>]*rel=["']manifest["'][^>]*href=["']([^"']+)["']/i)
    if (manM) {
      try {
        const manUrl = new URL(manM[1], base).href
        const manRes = await fetch(manUrl, { headers: { 'User-Agent': 'SecHeaders/1.0' } })
        if (manRes.ok) {
          const man = await manRes.json()
          result.manifest = {
            url: manUrl,
            status: manRes.status,
            name: man.name,
            shortName: man.short_name,
            startUrl: man.start_url,
            display: man.display,
            themeColor: man.theme_color,
            backgroundColor: man.background_color,
            icons: (man.icons || []).length,
          }
        }
      } catch { result.manifest = { error: 'Failed to fetch manifest' } }
    } else { result.manifest = null }

    // service worker
    const swM = html.match(/navigator\s*\.\s*serviceWorker\s*\.\s*register\s*\(\s*["']([^"']+)["']/i)
    result.serviceWorker = swM ? swM[1] : null

    // viewport
    const vpM = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i)
    result.viewport = vpM ? vpM[1] : null

    // apple-touch-icon
    const appIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i)
    result.appleTouchIcon = appIcon ? appIcon[1] : null

    // theme-color
    const tcM = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
    result.themeColor = tcM ? tcM[1] : null

    // HTTPS check
    result.https = target.startsWith('https://')

  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { url: target, ...result } })
}
