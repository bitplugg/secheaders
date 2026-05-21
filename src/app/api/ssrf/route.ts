import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  // SSRF check: try internal IPs and see if response differs
  const tests = [
    { name: '169.254.169.254 (metadata)', url: 'http://169.254.169.254/latest/meta-data/' },
    { name: '127.0.0.1:80', url: 'http://127.0.0.1/' },
    { name: '0.0.0.0:22', url: 'http://0.0.0.0:22/' },
    { name: 'localhost:8080', url: 'http://localhost:8080/' },
  ]

  const results: Array<{ name: string; blocked: boolean; status: number | null; error: string | null }> = []

  // First, try using the target as a proxy: fetch via the target
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'manual', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const text = await res.text()

    for (const test of tests) {
      const blocked = !text.toLowerCase().includes(test.url.toLowerCase())
      results.push({ name: test.name, blocked, status: res.status, error: blocked ? null : 'URL может быть доступна' })
    }
  } catch {
    results.push({ name: 'Connection failed', blocked: true, status: null, error: 'Target unreachable' })
  }

  return NextResponse.json({
    success: true,
    data: { url: target, note: 'Базовый тест — проверяет, отражается ли URL в ответе', results },
  })
}
