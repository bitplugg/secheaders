# SecHeaders — Node.js SDK

Официальный Node.js SDK для API [SecHeaders](https://secheaders.vercel.app) — Web Security Toolkit.

```bash
npm install secheaders
```

---

## Быстрый старт

```typescript
import { SecHeaders } from 'secheaders'

const api = new SecHeaders()

// Сканировать заголовки безопасности
const result = await api.scan('https://example.com')
console.log(result.grade)          // "D"
console.log(result.overallScore)   // 5
console.log(result.headers)

// Оценка A–F по 11 security-заголовкам:
// HSTS, CSP, X-Frame-Options, X-Content-Type-Options,
// Referrer-Policy, Permissions-Policy, COOP, COEP,
// X-Powered-By, Server, X-AspNet-Version
```

---

## Полная документация

### `SecHeaders(url?)`

Создаёт клиент. `url` — base URL API (по умолчанию `https://secheaders.vercel.app`).

```typescript
import { SecHeaders } from 'secheaders'

// Продакшен
const api = new SecHeaders()

// Локальная разработка
const dev = new SecHeaders('http://localhost:3000')
```

---

### 1. `scan(url)` — Анализ заголовков безопасности

```typescript
const result = await api.scan('https://google.com')

// result: ScanResult
result.url            // "https://google.com"
result.status         // 200
result.overallScore   // 6
result.maxScore       // 11
result.grade          // "D"
result.timestamp      // 1716000000000

result.headers.forEach(h => {
  h.name          // "strict-transport-security"
  h.displayName   // "HSTS"
  h.description   // "HTTP Strict Transport Security..."
  h.value         // "max-age=63072000..."  | null
  h.score         // 1
  h.maxScore      // 1
  h.details       // "Header present, max-age >= 1 year"
})
```

---

### 2. `batch(urls)` — Массовое сканирование

```typescript
const result = await api.batch([
  'https://google.com',
  'https://github.com',
  'https://vercel.com'
])

// result: { results: BatchResult[], total: number }
result.total         // 3
result.results[0]    // { url, status, overallScore, maxScore, grade, timestamp }
result.results[0].grade  // "D"
```

Максимум **10 URL** за один запрос.

---

### 3. `compare(a, b)` — Сравнение двух сайтов

```typescript
const result = await api.compare('https://google.com', 'https://yahoo.com')

result.a   // ScanResult
result.b   // ScanResult
result.a.grade  // "D"
result.b.grade  // "C"
```

---

### 4. `dns(domain, types?)` — DNS-запросы

Типы по умолчанию: `A,AAAA,MX,TXT,NS,CNAME`

```typescript
// Все типы
const dns = await api.dns('google.com')

// Выборочно
const mx = await api.dns('google.com', 'MX,TXT')

dns.domain  // "google.com"
dns.records.A.forEach(r => {
  r.name    // "google.com"
  r.type    // 1
  r.ttl     // 300
  r.value   // "142.250.185.78"
})
dns.records.MX[0].value  // "30 alt2.aspmx.l.google.com."
dns.records.TXT[0].value // "v=spf1 include:_spf.google.com ~all"
```

---

### 5. `ssl(url)` — SSL / HTTPS / HSTS

```typescript
const ssl = await api.ssl('https://google.com')

ssl.https     // true
ssl.hsts      // true
ssl.redirect  // null | "http://..."
ssl.note      // ""
```

---

### 6. `tls(url)` — TLS / HTTP/2 / HTTP/3

```typescript
const tls = await api.tls('https://google.com')

tls.http2         // true
tls.http3         // false
tls.altSvc        // "h3=\":443\"; ma=2592000,..."
tls.altSvcProtocols  // ["h3"]
tls.upgrade       // false
tls.note          // ""
```

---

### 7. `cors(url)` — CORS-заголовки

```typescript
const cors = await api.cors('https://api.example.com')

cors.origin         // "*" | "https://example.com" | null
cors.methods        // "GET, POST"
cors.headers        // "Content-Type"
cors.credentials    // false
cors.maxAge         // 86400 | null
cors.exposeHeaders  // "X-RateLimit" | null
cors.note           // ""
```

---

### 8. `cookies(url)` — Cookie-безопасность

```typescript
const cookies = await api.cookies('https://example.com')

cookies.total       // 5
cookies.secure      // 3 (количество Secure-кук)
cookies.httpOnly    // 2 (количество HttpOnly-кук)

cookies.cookies[0]  // {
//   name: "sessionid",
//   value: "abc123",
//   secure: true,
//   httpOnly: true,
//   sameSite: "Lax",
//   domain: ".example.com",
//   path: "/",
//   maxAge: "3600"
// }
```

---

### 9. `mixed(url)` — Mixed Content

```typescript
const mixed = await api.mixed('https://example.com')

mixed.url       // "https://example.com"
mixed.mixed     // true | false
mixed.resources // ["http://cdn.example.com/img.png"]
mixed.count     // 1
mixed.note      // ""
```

---

### 10. `redirects(url)` — Цепочка редиректов

```typescript
const redir = await api.redirects('https://httpbin.org/redirect/3')

redir.url        // "https://httpbin.org/redirect/3"
redir.finalUrl   // "https://httpbin.org/get"
redir.count      // 3
redir.chain      // [{ url: "...", status: 302 }, ...]
redir.note       // ""
```

---

### 11. `gzip(url)` — Проверка сжатия

```typescript
const gzip = await api.gzip('https://example.com')

gzip.url             // "https://example.com"
gzip.gzip            // true
gzip.brotli          // true
gzip.encoding        // "gzip, br"
gzip.originalSize    // 1250000
gzip.compressedSize  // 34000
gzip.savings         // 97.3  (%)
```

---

### 12. `csp(url)` — CSP-анализ

```typescript
const csp = await api.csp('https://google.com')

csp.url           // "https://google.com"
csp.directives    // {
//   "default-src": ["'self'", "*.google.com"],
//   "script-src": ["'self'", "'unsafe-inline'"],
//   "img-src": ["*"],
//   ...
// }
csp.reportOnly    // false
csp.raw           // "default-src 'self'..."
```

---

### 13. `cspEval(url)` — CSP-оценка безопасности

```typescript
const eval = await api.cspEval('https://example.com')

eval.score       // 75
eval.maxScore    // 100
eval.grade       // "C"
eval.issues      // [{
//   directive: "script-src",
//   severity: "high",
//   message: "'unsafe-inline' allows inline scripts"
// }]
```

---

### 14. `pwa(url)` — PWA-валидация

```typescript
const pwa = await api.pwa('https://example.com')

pwa.manifest        // true
pwa.serviceWorker   // false
pwa.https           // true
pwa.viewport        // true
pwa.icons           // 3
pwa.display         // "standalone"
pwa.name            // "Example App"
pwa.score           // 60  (из 100)
```

---

### 15. `subdomains(domain)` — Поддомены

```typescript
const subs = await api.subdomains('google.com')

subs.domain     // "google.com"
subs.subdomains // ["mail.google.com", "cloud.google.com", ...]
subs.total      // 247
```

---

### 16. `email(domain)` — Email-безопасность

```typescript
const email = await api.email('google.com')

email.domain         // "google.com"
email.spf.exists     // true
email.spf.record     // "v=spf1 include:_spf.google.com ~all"
email.spf.valid      // true

email.dkim.exists    // true
email.dkim.records   // ["google._domainkey.google.com ..."]

email.dmarc.exists   // true
email.dmarc.record   // "v=DMARC1; p=reject;..."
email.dmarc.policy   // "reject"
```

---

### 17. `server(url)` — Информация о сервере

```typescript
const server = await api.server('https://example.com')

server.url        // "https://example.com"
server.server     // "nginx/1.24.0"
server.poweredBy  // "Express"
server.via        // "1.1 varnish"
server.cfRay      // "888abc123..."
server.age        // "123"
```

---

### 18. `pageInfo(url)` — Информация о странице

```typescript
const info = await api.pageInfo('https://example.com')

info.url          // "https://example.com"
info.title        // "Example Domain"
info.charset      // "utf-8"
info.lang         // "en"
info.viewport     // "width=device-width, initial-scale=1"
info.contentType  // "text/html"
info.links        // 42
info.scripts      // 12
info.images       // 8
info.size         // 125000  (байт)
```

---

### 19. `cdn(url)` — Определение CDN

```typescript
const cdn = await api.cdn('https://example.com')

cdn.url       // "https://example.com"
cdn.cdn       // "Cloudflare" | "Fastly" | "Akamai" | null
cdn.detected  // true
cdn.headers   // { "cf-ray": "...", "server": "cloudflare" }
```

---

### 20. `schema(url)` — Schema.org / JSON-LD

```typescript
const schema = await api.schema('https://example.com')

schema.url      // "https://example.com"
schema.schemas  // [{ "@context": "https://schema.org", ... }]
schema.total    // 1
schema.types    // ["WebSite", "Organization"]
```

---

### 21. `whois(domain)` — WHOIS-данные

```typescript
const whois = await api.whois('example.com')

whois.domain       // "example.com"
whois.events       // [{ date: "1997-08-13T04:00:00Z", action: "registration" }]
whois.entities     // ["Internet Assigned Numbers Authority"]
whois.nameservers  // ["a.iana-servers.net", "b.iana-servers.net"]
whois.raw          // null
```

---

### 22. `preview(url)` — Open Graph / Link Preview

```typescript
const preview = await api.preview('https://github.com')

preview.url         // "https://github.com"
preview.title       // "GitHub: Let's build from here"
preview.description // "GitHub is where over 100 million..."
preview.image       // "https://github.githubassets.com/og-image.png"
preview.siteName    // "github.com"
preview.icon        // "https://github.com/favicon.ico"
```

---

### 23. `sri(url)` — SRI-валидация

```typescript
const sri = await api.sri('https://example.com')

sri.url              // "https://example.com"
sri.scripts          // [{ src: "https://cdn.example.com/app.js", integrity: "sha384-...", crossorigin: "anonymous" }]
sri.total            // 15
sri.withIntegrity    // 3
```

---

### 24. `sriGen(url, algorithm?)` — Генерация SRI-хеша

```typescript
// algorithm: "sha256" | "sha384" (default) | "sha512"
const sri = await api.sriGen('https://code.jquery.com/jquery-3.7.1.min.js')

sri.url              // "https://code.jquery.com/jquery-3.7.1.min.js"
sri.algorithm        // "sha384"
sri.hash             // "d4e5f6..." (hex)
sri.base64Integrity  // "sha384-1A2B3C..." (готовый integrity-атрибут)
sri.size             // 89543
```

---

### 25. `methods(url)` — HTTP-методы

```typescript
const methods = await api.methods('https://example.com')

methods.url      // "https://example.com"
methods.methods  // ["GET", "HEAD", "OPTIONS"]
methods.unsafe   // []  (PUT, DELETE, PATCH, TRACE)
```

---

### 26. `contrast(fg, bg, fontSize?)` — Цветовой контраст (WCAG)

```typescript
const contrast = await api.contrast('#000000', '#ffffff')

contrast.foreground    // "#000000"
contrast.background    // "#ffffff"
contrast.contrastRatio // 21
contrast.aa            // true  (AA для обычного текста)
contrast.aaa           // true  (AAA для обычного текста)
contrast.isLargeText   // false
contrast.fontSize      // 16

// С указанием размера шрифта
const large = await api.contrast('#666666', '#ffffff', 24)
large.aa  // true  (для крупного текста порог 3:1)
```

---

### 27. `encode(input, type?)` / `decode(input, type?)` — Кодирование

```typescript
type = "base64" (default) | "url"

// Base64
const enc = await api.encode('hello world')
enc.result  // "aGVsbG8gd29ybGQ="

const dec = await api.decode('aGVsbG8gd29ybGQ=')
dec.result  // "hello world"

// URL-encoding
const urlEnc = await api.encode('hello world', 'url')
urlEnc.result  // "hello+world"

const urlDec = await api.decode('hello+world', 'url')
urlDec.result  // "hello world"
```

---

### 28. `hash(input, algorithm?)` — Хеширование

```typescript
algorithm = "sha1" | "sha256" (default) | "sha384" | "sha512"

const h = await api.hash('hello')
h.hash  // "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"

const h384 = await api.hash('hello', 'sha384')
h384.hash  // "59e17457..."
```

---

### 29. `jwt(token)` — Декодирование JWT

```typescript
const jwt = await api.jwt('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')

jwt.header   // { alg: "HS256", typ: "JWT" }
jwt.payload  // { sub: "1234567890", name: "John Doe", iat: 1516239022 }
jwt.signature   // "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
jwt.algorithm   // "HS256"
jwt.type        // "JWT"
```

---

### 30. `pretty(input, type?)` — Pretty Print

```typescript
type = "auto" (default) | "json" | "xml"

const pp = await api.pretty('{"name":"John","age":30}')
pp.pretly    // "{\n  \"name\": \"John\",\n  \"age\": 30\n}"
pp.minified  // "{\"name\":\"John\",\"age\":30}"
pp.length    // 20
```

---

### 31. `ping(url)` — Проверка доступности

```typescript
const ping = await api.ping('https://example.com')

ping.url       // "https://example.com"
ping.reachable // true
ping.status    // 200
ping.ms        // 145
```

---

## Обработка ошибок

Все методы выбрасывают ошибку при неудачном запросе:

```typescript
try {
  const result = await api.scan('')
} catch (err) {
  console.error(err.message) // "URL parameter is required"
}

try {
  const result = await api.scan('https://несуществующий-сайт-12345.ru')
} catch (err) {
  console.error(err.message) // "fetch failed" / "Site unreachable"
}
```

Типизированные ошибки:

```typescript
const result = await api.scan('https://example.com').catch(err => {
  if (err.message.includes('fetch failed')) {
    // Сайт недоступен
  }
  if (err.message.includes('400')) {
    // Неверные параметры
  }
})
```

---

## TypeScript

Все типы экспортируются:

```typescript
import {
  SecHeaders,
  ScanResult,
  BatchResult,
  DnsResult,
  SslResult,
  TlsResult,
  CorsResult,
  CookieResult,
  MixedContentResult,
  RedirectResult,
  GzipResult,
  CspResult,
  CspEvalResult,
  PwaResult,
  SubdomainResult,
  EmailSecurityResult,
  ServerResult,
  PageInfoResult,
  CdnResult,
  SchemaResult,
  WhoisResult,
  PreviewResult,
  SriCheckResult,
  SriGenResult,
  MethodsResult,
  ContrastResult,
  EncodeResult,
  HashResult,
  JwtResult,
  PrettyResult,
  PingResult,
  ApiResponse,
} from 'secheaders'
```

---

## CommonJS

```javascript
const { SecHeaders } = require('secheaders')

async function main() {
  const api = new SecHeaders()
  const result = await api.scan('https://example.com')
  console.log(result.grade)
}
main()
```

---

## Пример CLI-скрипта

```typescript
#!/usr/bin/env node
import { SecHeaders } from 'secheaders'

const [cmd, ...args] = process.argv.slice(2)

if (!cmd) {
  console.log('Usage: secheaders scan|dns|ssl|csp <target>')
  process.exit(1)
}

const api = new SecHeaders()
const target = args[0]

switch (cmd) {
  case 'scan': {
    const r = await api.scan(target)
    console.log(`${r.grade} (${r.overallScore}/${r.maxScore})`)
    break
  }
  case 'dns': {
    const r = await api.dns(target)
    for (const [type, records] of Object.entries(r.records)) {
      console.log(`\n${type}:`)
      records.forEach(r => console.log(`  ${r.value}`))
    }
    break
  }
  case 'ssl': {
    const r = await api.ssl(target)
    console.log(`HTTPS: ${r.https}, HSTS: ${r.hsts}`)
    break
  }
  case 'csp': {
    const r = await api.csp(target)
    console.log(r.raw || 'No CSP')
    break
  }
}
```

---

## Ссылки

- **Документация API**: [secheaders.vercel.app/docs](https://secheaders.vercel.app/docs)
- **Исходный код**: [github.com/.../secheaders](https://github.com)
- **npm**: [npmjs.com/package/secheaders](https://npmjs.com/package/secheaders)

---

## Лицензия

MIT
