import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input') || ''
  const algorithm = request.nextUrl.searchParams.get('algorithm') || 'sha256'

  if (!input) return NextResponse.json({ success: false, error: 'input required' }, { status: 400 })

  const allowed = ['sha1', 'sha256', 'sha384', 'sha512']
  if (!allowed.includes(algorithm)) return NextResponse.json({ success: false, error: 'Unsupported algorithm' }, { status: 400 })

  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return NextResponse.json({ success: true, data: { input, algorithm, hash: hashHex } })
}
