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

    const html = await res.text()
    const resources: Array<{ tag: string; src: string; integrity: string | null; hasSRI: boolean }> = []

    const scriptRe = /<script[\s>][\s\S]*?<\/script>/gi
    let match
    while ((match = scriptRe.exec(html)) !== null) {
      const tag = match[0]
      const srcMatch = tag.match(/src\s*=\s*["']([^"']+)["']/)
      if (srcMatch) {
        const integrityMatch = tag.match(/integrity\s*=\s*["']([^"']+)["']/)
        resources.push({
          tag: 'script',
          src: srcMatch[1],
          integrity: integrityMatch ? integrityMatch[1] : null,
          hasSRI: !!integrityMatch,
        })
      }
    }

    const linkRe = /<link[\s>][\s\S]*?\/?>/gi
    while ((match = linkRe.exec(html)) !== null) {
      const tag = match[0]
      const relMatch = tag.match(/rel\s*=\s*["']([^"']+)["']/)
      if (relMatch && (relMatch[1].includes('stylesheet') || relMatch[1] === 'preload')) {
        const hrefMatch = tag.match(/href\s*=\s*["']([^"']+)["']/)
        if (hrefMatch) {
          const integrityMatch = tag.match(/integrity\s*=\s*["']([^"']+)["']/)
          resources.push({
            tag: 'link',
            src: hrefMatch[1],
            integrity: integrityMatch ? integrityMatch[1] : null,
            hasSRI: !!integrityMatch,
          })
        }
      }
    }

    const total = resources.length
    const withSRI = resources.filter(r => r.hasSRI).length

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        total,
        withSRI,
        percent: total > 0 ? Math.round((withSRI / total) * 100) : 100,
        resources,
      },
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
    }, { status: 500 })
  }
}
