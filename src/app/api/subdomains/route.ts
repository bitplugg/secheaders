import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ success: false, error: 'domain required' }, { status: 400 })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`https://crt.sh/?q=%25.${domain}&output=json`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SecHeaders/1.0' },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'crt.sh error' }, { status: 502 })
    }

    const data = await res.json()
    const subdomains = new Set<string>()

    for (const entry of data as Array<{ name_value: string }>) {
      const names = entry.name_value.split('\n')
      for (const name of names) {
        const clean = name.trim().toLowerCase()
        if (clean.endsWith(`.${domain}`) || clean === domain) {
          subdomains.add(clean)
        }
      }
    }

    const sorted = [...subdomains].sort()

    return NextResponse.json({
      success: true,
      data: {
        domain,
        count: sorted.length,
        subdomains: sorted,
      },
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
