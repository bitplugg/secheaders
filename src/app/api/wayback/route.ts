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
    const waybackUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(target)}`
    const res = await fetch(waybackUrl, { signal: controller.signal, headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    const data = await res.json()
    const snapshots = data.archived_snapshots || {}

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        archived: Object.keys(snapshots).length > 0,
        snapshots: snapshots,
        waybackUrl: snapshots.closest?.url || null,
        timestamp: snapshots.closest?.timestamp || null,
        status: snapshots.closest?.status || null,
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
