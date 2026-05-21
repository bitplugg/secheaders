import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const urlsParam = request.nextUrl.searchParams.get('urls') || process.env.MONITOR_URLS
  const telegramToken = request.nextUrl.searchParams.get('token') || process.env.TELEGRAM_BOT_TOKEN
  const telegramChat = request.nextUrl.searchParams.get('chat') || process.env.TELEGRAM_CHAT_ID

  if (!urlsParam) return NextResponse.json({ success: false, error: 'urls required' }, { status: 400 })

  const urls = urlsParam.split(',').map(u => u.trim()).filter(Boolean)
  const results: any[] = []

  for (const url of urls) {
    const target = url.startsWith('http') ? url : 'https://' + url
    const start = Date.now()
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeadersCron/1.0' } })
      clearTimeout(timeout)
      results.push({ url: target, status: res.ok ? 'ok' : 'error', httpStatus: res.status, ms: Date.now() - start, checkedAt: new Date().toISOString() })
    } catch {
      results.push({ url: target, status: 'error', httpStatus: 0, ms: Date.now() - start, checkedAt: new Date().toISOString(), error: 'Unreachable' })
    }
  }

  const failed = results.filter(r => r.status === 'error')

  // Telegram alert if configured
  if (telegramToken && telegramChat && failed.length > 0) {
    const msg = `🚨 *SecHeaders Monitor Alert*\n\n${failed.map(f => `❌ ${f.url} — ${f.error || `HTTP ${f.httpStatus}`}`).join('\n')}\n\n🕐 ${new Date().toISOString()}`
    try {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChat, text: msg, parse_mode: 'Markdown' }),
      })
    } catch {}
  }

  return NextResponse.json({
    success: true,
    data: { results, summary: { total: results.length, ok: results.filter(r => r.status === 'ok').length, failed: failed.length }, alerted: failed.length > 0 && !!telegramToken },
  })
}
