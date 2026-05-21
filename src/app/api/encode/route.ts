import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input') || ''
  const action = request.nextUrl.searchParams.get('action') || 'encode'
  const type = request.nextUrl.searchParams.get('type') || 'base64'

  if (!input) return NextResponse.json({ success: false, error: 'input required' }, { status: 400 })

  try {
    let result: string
    if (type === 'base64') {
      result = action === 'encode'
        ? btoa(unescape(encodeURIComponent(input)))
        : decodeURIComponent(escape(atob(input)))
    } else if (type === 'url') {
      result = action === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { input, result, action, type } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 400 })
  }
}
