import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url') || ''
  const algorithm = request.nextUrl.searchParams.get('algorithm') || 'sha384'

  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  const allowed = ['sha256', 'sha384', 'sha512']
  if (!allowed.includes(algorithm)) return NextResponse.json({ success: false, error: 'Unsupported algorithm' }, { status: 400 })

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    if (!res.ok) return NextResponse.json({ success: false, error: `HTTP ${res.status}` }, { status: 400 })

    const buf = await res.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), buf)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    const integrity = `${algorithm}-${btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))}`

    return NextResponse.json({
      success: true,
      data: { url, algorithm, hash: hashHex, base64Integrity: integrity, size: buf.byteLength },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
