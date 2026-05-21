import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  if (!domain) return NextResponse.json({ success: false, error: 'domain required' }, { status: 400 })

  const records: Record<string, { value: string; parsed?: Record<string, string> }> = {}

  const queryDNS = async (type: string) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/dns-json' },
      })
      clearTimeout(timeout)
      if (!res.ok) return
      const json = await res.json()
      if (json.Answer) {
        records[type] = { value: json.Answer.map((a: any) => a.data).join('\n') }
      }
    } catch { /* ignore */ }
  }

  await Promise.all(['TXT', 'CNAME', 'MX'].map(queryDNS))

  // Parse SPF from TXT
  if (records.TXT) {
    const txts = records.TXT.value.split('\n')
    const spf = txts.find(t => t.startsWith('v=spf1'))
    if (spf) {
      records['SPF'] = { value: spf, parsed: parseSPF(spf) }
    }
    const dkimSelectors = txts.filter(t => t.includes('dkim') || t.includes('_domainkey'))
    if (dkimSelectors.length > 0) {
      records['DKIM (possible)'] = { value: dkimSelectors.join('\n') }
    }
  }

  // DMARC
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent('_dmarc.' + domain)}&type=TXT`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/dns-json' },
    })
    clearTimeout(timeout)
    if (res.ok) {
      const json = await res.json()
      if (json.Answer) {
        const dmarc = json.Answer.map((a: any) => a.data).join('\n')
        records['DMARC'] = { value: dmarc, parsed: parseDMARC(dmarc) }
      }
    }
  } catch { /* ignore */ }

  return NextResponse.json({ success: true, data: { domain, records } })
}

function parseSPF(value: string): Record<string, string> {
  const result: Record<string, string> = {}
  const parts = value.split(/\s+/)
  for (const p of parts) {
    if (p.startsWith('v=')) result.version = p.slice(2)
    else if (p.startsWith('include:')) result.include = (result.include ? result.include + ', ' : '') + p.slice(8)
    else if (p.startsWith('ip4:')) result.ip4 = (result.ip4 ? result.ip4 + ', ' : '') + p.slice(4)
      else if (p.startsWith('ip6:')) result.ip6 = (result.ip6 ? result.ip6 + ', ' : '') + p.slice(4)
    else if (p.startsWith('redirect=')) result.redirect = p.slice(9)
    else if (p === '~all') result.policy = 'softfail (~all)'
    else if (p === '-all') result.policy = 'fail (-all)'
    else if (p === '+all') result.policy = 'pass (+all)'
    else if (p === '?all') result.policy = 'neutral (?all)'
  }
  return result
}

function parseDMARC(value: string): Record<string, string> {
  const result: Record<string, string> = {}
  const parts = value.split(';')
  for (const p of parts) {
    const eq = p.indexOf('=')
    if (eq > 0) {
      const k = p.slice(0, eq).trim()
      const v = p.slice(eq + 1).trim()
      result[k] = v
    }
  }
  return result
}
