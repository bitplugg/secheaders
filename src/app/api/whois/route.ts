import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ success: false, error: 'domain required' }, { status: 400 })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    // Try RDAP
    const rdapUrl = `https://rdap.org/domain/${domain}`
    const res = await fetch(rdapUrl, { signal: controller.signal, headers: { 'User-Agent': 'SecHeaders/1.0', 'Accept': 'application/json' } })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `RDAP returned ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const info: Record<string, string> = {}

    if (data.handle) info.handle = data.handle
    if (data.port43) info.whoisServer = data.port43

    const events = data.events || []
    for (const ev of events) {
      if (ev.eventAction === 'registration') info.created = ev.eventDate
      if (ev.eventAction === 'expiration') info.expires = ev.eventDate
      if (ev.eventAction === 'last changed') info.changed = ev.eventDate
    }

    const entities = data.entities || []
    for (const ent of entities) {
      const roles = (ent.roles || []).join(', ')
      for (const vcard of ent.vcardArray?.[1] || []) {
        if (vcard[0] === 'fn') info[`${roles}: Name`] = vcard[3]
        if (vcard[0] === 'email') info[`${roles}: Email`] = vcard[3]
      }
    }

    const nameservers = (data.nameservers || []).map((ns: any) => ns.ldhName).join(', ')
    if (nameservers) info.nameservers = nameservers

    if (data.remarks?.[0]?.description) info.remarks = data.remarks[0].description.join('; ')

    return NextResponse.json({ success: true, data: { domain, info } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
