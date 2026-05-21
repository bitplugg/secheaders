export interface HeaderDef {
  key: string
  display: string
  desc: string
  docUrl: string
}

export const HEADERS: HeaderDef[] = [
  {
    key: 'strict-transport-security',
    display: 'Strict-Transport-Security',
    desc: 'Принудительное HTTPS-соединение. Защищает от SSL-stripping атак.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
  },
  {
    key: 'content-security-policy',
    display: 'Content-Security-Policy',
    desc: 'Контролирует, какие ресурсы могут загружаться на странице. Защита от XSS.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy',
  },
  {
    key: 'x-content-type-options',
    display: 'X-Content-Type-Options',
    desc: 'Запрещает MIME-sniffing. Должен быть `nosniff`.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
  },
  {
    key: 'x-frame-options',
    display: 'X-Frame-Options',
    desc: 'Защита от clickjacking. Должен быть `DENY` или `SAMEORIGIN`.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
  },
  {
    key: 'referrer-policy',
    display: 'Referrer-Policy',
    desc: 'Контролирует передачу Referer-заголовка между сайтами.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
  },
  {
    key: 'permissions-policy',
    display: 'Permissions-Policy',
    desc: 'Ограничивает доступ к API браузера (камера, микрофон, геолокация).',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
  },
  {
    key: 'cross-origin-opener-policy',
    display: 'Cross-Origin-Opener-Policy',
    desc: 'Изолирует окно от cross-origin открывателей.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy',
  },
  {
    key: 'cross-origin-embedder-policy',
    display: 'Cross-Origin-Embedder-Policy',
    desc: 'Требует CORP для загружаемых ресурсов.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy',
  },
  {
    key: 'cross-origin-resource-policy',
    display: 'Cross-Origin-Resource-Policy',
    desc: 'Контролирует доступ к ресурсу с других источников.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy',
  },
  {
    key: 'cache-control',
    display: 'Cache-Control',
    desc: 'Контролирует кэширование. Для sensitive страниц нужен `no-store`.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control',
  },
  {
    key: 'set-cookie',
    display: 'Set-Cookie',
    desc: 'Флаги Secure, HttpOnly, SameSite для защиты cookie.',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie',
  },
]

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface ScoreResult {
  score: number
  maxScore: number
  details: string
}

export function scoreHSTS(value: string | null): ScoreResult {
  if (!value) return { score: 0, maxScore: 5, details: 'Заголовок отсутствует' }
  const lower = value.toLowerCase()
  let points = 0
  const maxAgeMatch = lower.match(/max-age=(\d+)/)
  if (maxAgeMatch) {
    const maxAge = parseInt(maxAgeMatch[1])
    if (maxAge >= 31536000) points += 3
    else if (maxAge >= 86400) points += 2
    else points += 1
  }
  if (/includesubdomains/i.test(lower)) points += 1
  if (/preload/i.test(lower)) points += 1
  if (!maxAgeMatch) points = Math.max(0, points - 1)
  return {
    score: Math.min(points, 5),
    maxScore: 5,
    details: points >= 4
      ? 'Отличная конфигурация HSTS (долгий max-age + includesSubDomains + preload)'
      : points >= 2
        ? 'HSTS настроен, но можно усилить'
        : 'HSTS отсутствует или настроен слабо',
  }
}

export function scoreCSP(value: string | null): ScoreResult {
  if (!value) return { score: 0, maxScore: 5, details: 'Заголовок отсутствует — сайт уязвим к XSS' }
  const lower = value.toLowerCase()
  let points = 1
  if (/\bdefault-src\b/.test(lower)) points += 1
  if (!/unsafe-inline/.test(lower)) points += 1
  if (!/unsafe-eval/.test(lower)) points += 1
  if (!/\*/.test(lower.replace(/'.*?'/g, '').replace(/".*?"/g, ''))) points += 1
  if (/upgrade-insecure-requests/i.test(lower)) points += 0.5
  return {
    score: Math.min(points, 5),
    maxScore: 5,
    details: points >= 4
      ? 'CSP настроен хорошо, без опасных директив'
      : points >= 2
        ? 'CSP присутствует, но содержит unsafe-inline/unsafe-eval или wildcard'
        : 'CSP настроен слишком слабо',
  }
}

export function scoreSimple(
  value: string | null,
  expected: string,
  goodHint: string,
  badHint: string,
  allowPartial?: string[],
): ScoreResult {
  if (!value) return { score: 0, maxScore: 5, details: badHint }
  if (value.toLowerCase().includes(expected.toLowerCase())) {
    return { score: 5, maxScore: 5, details: goodHint }
  }
  if (allowPartial?.some(v => value.toLowerCase().includes(v.toLowerCase()))) {
    return { score: 3, maxScore: 5, details: `${goodHint} (частично)` }
  }
  return { score: 1, maxScore: 5, details: badHint }
}

export function scoreReferrerPolicy(value: string | null): ScoreResult {
  if (!value) return { score: 1, maxScore: 5, details: 'Заголовок отсутствует — может передаваться полный Referer' }
  const strict = ['strict-origin-when-cross-origin', 'strict-origin', 'same-origin', 'no-referrer']
  const relaxed = ['origin-when-cross-origin', 'origin', 'unsafe-url']
  for (const s of strict) {
    if (value.toLowerCase().includes(s)) return { score: 5, maxScore: 5, details: `Используется ${s} — хороший уровень защиты` }
  }
  for (const s of relaxed) {
    if (value.toLowerCase().includes(s)) return { score: 3, maxScore: 5, details: `Используется ${s} — можно усилить` }
  }
  return { score: 2, maxScore: 5, details: `Неизвестное значение: ${value}` }
}

export function scoreCacheControl(value: string | null): ScoreResult {
  if (!value) return { score: 1, maxScore: 5, details: 'Заголовок отсутствует' }
  const lower = value.toLowerCase()
  if (/no-store/i.test(lower)) return { score: 5, maxScore: 5, details: 'Установлен no-store — данные не кэшируются' }
  if (/no-cache/i.test(lower)) return { score: 4, maxScore: 5, details: 'Установлен no-cache' }
  if (/private/i.test(lower)) return { score: 3, maxScore: 5, details: 'Private — кэш только на клиенте' }
  if (/public/i.test(lower)) return { score: 2, maxScore: 5, details: 'Public — может кэшироваться на прокси' }
  return { score: 2, maxScore: 5, details: `Значение: ${value}` }
}

export function scoreSetCookie(headers: Record<string, string>): ScoreResult {
  const cookie = headers['set-cookie']
  if (!cookie) return { score: 3, maxScore: 5, details: 'Cookie не устанавливаются (нейтрально)' }
  const lower = cookie.toLowerCase()
  let points = 0
  if (/secure/i.test(lower)) points += 2
  if (/httponly/i.test(lower)) points += 1.5
  if (/samesite=strict/i.test(lower)) points += 1.5
  else if (/samesite=lax/i.test(lower)) points += 1
  return {
    score: Math.min(points, 5),
    maxScore: 5,
    details: points >= 4
      ? 'Cookie-флаги настроены правильно (Secure + HttpOnly + SameSite)'
      : points > 0
        ? 'Есть некоторые флаги, но не все'
        : 'Cookie без защиты Secure/HttpOnly/SameSite',
  }
}

export function gradeFromScore(score: number, maxScore: number): Grade {
  const pct = score / maxScore
  if (pct >= 0.9) return 'A'
  if (pct >= 0.75) return 'B'
  if (pct >= 0.6) return 'C'
  if (pct >= 0.45) return 'D'
  if (pct >= 0.25) return 'E'
  return 'F'
}

export function analyzeHeaders(responseHeaders: Record<string, string>): {
  checks: Array<{
    name: string
    displayName: string
    description: string
    value: string | null
    score: number
    maxScore: number
    details: string
  }>
  overallScore: number
  maxScore: number
} {
  const getHeader = (key: string) => {
    const entry = Object.entries(responseHeaders).find(
      ([k]) => k.toLowerCase() === key,
    )
    return entry ? entry[1] : null
  }

  const checks = HEADERS.map(h => {
    const rawValue = getHeader(h.key)
    const value = rawValue ?? null
    let result: ScoreResult

    switch (h.key) {
      case 'strict-transport-security':
        result = scoreHSTS(value)
        break
      case 'content-security-policy':
        result = scoreCSP(value)
        break
      case 'x-content-type-options':
        result = scoreSimple(value, 'nosniff',
          'X-Content-Type-Options: nosniff — включена защита от MIME-sniffing',
          'Отсутствует — браузер может угадывать MIME-тип',
        )
        break
      case 'x-frame-options':
        result = scoreSimple(value, 'deny',
          'X-Frame-Options: DENY — защита от clickjacking',
          'Отсутствует — страницу можно вставить в iframe',
          ['sameorigin', 'same-origin'],
        )
        break
      case 'referrer-policy':
        result = scoreReferrerPolicy(value)
        break
      case 'permissions-policy':
        result = scoreSimple(value, '',
          'Permissions-Policy задан — ограничены API браузера',
          'Отсутствует — все API браузера доступны (камера, микрофон и т.д.)',
        )
        // Adjust: if present at all, score 4; if with good restrictions, 5
        if (value) {
          result.score = value.length > 50 ? 5 : 4
          result.details = value.length > 50
            ? 'Permissions-Policy настроен с ограничениями'
            : 'Permissions-Policy присутствует, но слабый'
        }
        break
      case 'cross-origin-opener-policy':
        result = scoreSimple(value, 'same-origin',
          'COOP: same-origin — хорошая изоляция',
          'Отсутствует — окно может быть атаковано через cross-origin popup',
          ['same-origin-allow-popups'],
        )
        break
      case 'cross-origin-embedder-policy':
        result = scoreSimple(value, 'require-corp',
          'COEP: require-corp — строгая изоляция',
          'Отсутствует — ресурсы могут загружаться без проверки',
        )
        break
      case 'cross-origin-resource-policy':
        result = scoreSimple(value, 'same-origin',
          'CORP: same-origin — ресурс изолирован',
          'Отсутствует — ресурс доступен с других источников',
        )
        break
      case 'cache-control':
        result = scoreCacheControl(value)
        break
      case 'set-cookie':
        result = scoreSetCookie(responseHeaders)
        break
      default:
        result = { score: 0, maxScore: 5, details: 'Неизвестный заголовок' }
    }

    return {
      name: h.key,
      displayName: h.display,
      description: h.desc,
      value,
      score: result.score,
      maxScore: result.maxScore,
      details: result.details,
    }
  })

  const overallScore = checks.reduce((s, c) => s + c.score, 0)
  const maxScore = checks.reduce((s, c) => s + c.maxScore, 0)

  return { checks, overallScore, maxScore }
}
