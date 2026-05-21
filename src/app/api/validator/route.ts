import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const validatorUrl = `https://validator.w3.org/nu/?out=json&doc=${encodeURIComponent(target)}`
    const res = await fetch(validatorUrl, { signal: controller.signal, headers: { 'User-Agent': 'SecHeaders/1.0', 'Content-Type': 'text/html; charset=utf-8' } })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Validator returned ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const messages = (data.messages || []).map((m: any) => ({
      type: m.type,
      line: m.lastLine,
      col: m.lastColumn,
      message: m.message,
      extract: m.extract,
    }))

    const errors = messages.filter((m: any) => m.type === 'error')
    const warnings = messages.filter((m: any) => m.type === 'info')

    return NextResponse.json({
      success: true,
      data: {
        url: target,
        total: messages.length,
        errors: errors.length,
        warnings: warnings.length,
        messages: messages.slice(0, 50),
      },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
