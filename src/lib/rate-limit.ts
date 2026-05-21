const ipHits = new Map<string, { count: number; resetAt: number }>()
const MAX_HITS = 100
const WINDOW_MS = 60_000

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = ipHits.get(ip)

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_HITS - 1, resetAt: now + WINDOW_MS }
  }

  entry.count++

  if (entry.count > MAX_HITS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: MAX_HITS - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}
