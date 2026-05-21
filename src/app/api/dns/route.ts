import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const TYPES = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA', 'CAA', 'SRV'] as const

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  const typesParam = request.nextUrl.searchParams.get('types') || 'A,AAAA,MX,TXT,NS,CNAME'
  const types = typesParam.split(',').filter(t => TYPES.includes(t as any))

  if (!domain) return NextResponse.json({ success: false, error: 'domain required' }, { status: 400 })

  const results: Record<string, any[]> = {}

  for (const type of types) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/dns-json' },
      })
      clearTimeout(timeout)

      if (!res.ok) {
        results[type] = [{ error: `HTTP ${res.status}` }]
        continue
      }

      const json = await res.json()
      const answers = (json.Answer || []).map((a: any) => ({
        name: a.name,
        type: a.type,
        ttl: a.TTL,
        value: a.data,
      }))
      results[type] = answers.length > 0 ? answers : [{ note: 'No records' }]
    } catch (err) {
      results[type] = [{ error: err instanceof Error ? err.message : 'Query failed' }]
    }
  }

  return NextResponse.json({ success: true, data: { domain, records: results } })
}
