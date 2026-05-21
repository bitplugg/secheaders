import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''

  if (!token) return NextResponse.json({ success: false, error: 'token required' }, { status: 400 })

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return NextResponse.json({ success: false, error: 'Invalid JWT format' }, { status: 400 })

    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))

    return NextResponse.json({
      success: true,
      data: {
        header,
        payload,
        signature: parts[2],
        algorithm: header.alg || 'unknown',
        type: header.typ || 'JWT',
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed to decode' }, { status: 400 })
  }
}
