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

    const schemas: Array<{ type: string; data: string }> = []
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let m
    while ((m = re.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(m[1].trim())
        const type = parsed['@type'] || parsed['@graph']?.[0]?.['@type'] || 'Unknown'
        schemas.push({ type, data: JSON.stringify(parsed, null, 2).slice(0, 3000) })
      } catch { schemas.push({ type: 'Invalid JSON', data: m[1].trim().slice(0, 500) }) }
    }

    return NextResponse.json({ success: true, data: { url: target, total: schemas.length, schemas } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
