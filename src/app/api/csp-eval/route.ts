import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)

    const raw = res.headers.get('content-security-policy') || ''
    if (!raw) return NextResponse.json({ success: true, data: { present: false } })

    const directives: Array<{ name: string; values: string[]; issues: string[] }> = []
    raw.split(';').forEach(p => {
      const parts = p.trim().split(/\s+/)
      if (parts.length === 0) return
      const name = parts[0]
      const values = parts.slice(1)
      const issues: string[] = []

      if (values.includes("'unsafe-inline'")) issues.push('Разрешает unsafe-inline — риск XSS')
      if (values.includes("'unsafe-eval'")) issues.push('Разрешает unsafe-eval — риск инъекций')
      if (values.includes('*') && !name.includes('frame-ancestors') && !name.includes('form-action')) {
        issues.push('Wildcard (*) — слишком широкая директива')
      }
      if (name === 'script-src' && values.some(v => v.startsWith('http://'))) {
        issues.push('HTTP источник — нешифрованная передача')
      }
      if (name === 'default-src' && values.includes("'none'") && !directives.find(d => d.name === 'script-src')) {
        issues.push('default-src \'none\' без script-src — скрипты заблокированы')
      }

      directives.push({ name, values, issues })
    })

    return NextResponse.json({
      success: true,
      data: { present: true, raw, directives, totalIssues: directives.reduce((s, d) => s + d.issues.length, 0) },
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
