import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input') || ''
  const type = request.nextUrl.searchParams.get('type') || 'auto'

  if (!input) return NextResponse.json({ success: false, error: 'input required' }, { status: 400 })

  const format = (indent: number) => {
    if (type === 'json' || (type === 'auto' && (input.startsWith('{') || input.startsWith('[')))) {
      return JSON.stringify(JSON.parse(input), null, indent)
    }
    if (type === 'xml' || type === 'auto') {
      let result = ''
      let depth = 0
      for (let i = 0; i < input.length; i++) {
        const ch = input[i]
        if (ch === '<') {
          if (i > 0) result += '\n' + '  '.repeat(depth)
          result += ch
          if (input[i + 1] === '/') depth--
        } else if (ch === '>') {
          result += ch
          if (input[i - 1] === '/' || input[i - 2] === '/') { /* self-closing */ }
          else if (input[i + 1] && input[i + 1] === '<' && input[i + 2] !== '/') depth++
        } else {
          result += ch
        }
      }
      return result
    }
    return input
  }

  try {
    const pretty = format(2)
    const minified = format(0)
    return NextResponse.json({ success: true, data: { input: input.slice(0, 500), pretty, minified, length: input.length } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Format failed' }, { status: 400 })
  }
}
