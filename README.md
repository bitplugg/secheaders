<div align="center">
  <br/>
  <img src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/Edge_Runtime-000?style=for-the-badge&logo=vercel" alt="Edge Runtime"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=fff" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=fff" alt="Tailwind CSS"/>
  <br/><br/>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/stars/bitplugg/secheaders?style=for-the-badge&color=3b82f6">
    <img src="https://img.shields.io/github/stars/bitplugg/secheaders?style=for-the-badge&color=3b82f6">
  </picture>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge"/>
  <img src="https://img.shields.io/github/commit-activity/w/bitplugg/secheaders?style=for-the-badge"/>
</div>

<br/>

<div align="center">
  <h1>🛡️ SecHeaders — Web Security Toolkit</h1>
  <p>
    <strong>55 страниц, 47 API-эндпоинтов, 1 npm-пакет.</strong><br/>
    Полный набор инструментов для анализа безопасности веб-сайтов.<br/>
    Всё работает на <strong>Edge Runtime</strong> — быстро, бесплатно, без серверной инфраструктуры.
  </p>
  <p>
    <a href="https://zxc-r1spclf9a-bitplugg.vercel.app"><strong>🌐 Демо</strong></a> ·
    <a href="https://zxc-r1spclf9a-bitplugg.vercel.app/api-docs"><strong>📖 API Docs</strong></a> ·
    <a href="https://zxc-r1spclf9a-bitplugg.vercel.app/tools"><strong>🔧 Все инструменты</strong></a> ·
    <a href="#-npm-пакет"><strong>📦 npm</strong></a>
  </p>
</div>

<br/>

---

## 📦 npm-пакет

Установите SDK для программного доступа ко всем 47 API:

```bash
npm install secheaders
```

```typescript
import { SecHeaders } from 'secheaders'

const api = new SecHeaders()

// HTTP-заголовки
const scan = await api.scan('https://example.com')
console.log(scan.grade) // "D"

// DNS
const dns = await api.dns('google.com', 'A,MX,TXT')
console.log(dns.records.A)

// JWT
const jwt = await api.jwt('eyJhbGciOiJIUzI1NiIs...')
console.log(jwt.payload)

// Мониторинг нескольких сайтов
const monitor = await api.monitor(['https://google.com', 'https://github.com'])
console.log(monitor.summary)
```

<details>
<summary><strong>📋 Все 32 метода SDK</strong></summary>

| Метод | Описание |
|---|---|
| `scan(url)` | HTTP-заголовки, оценка A–F |
| `batch(urls[])` | Массовое сканирование (до 10) |
| `compare(a, b)` | Сравнение двух сайтов |
| `dns(domain, types?)` | A, AAAA, MX, TXT, NS, CNAME, SOA |
| `ssl(url)` | HTTPS + HSTS |
| `tls(url)` | HTTP/2, HTTP/3, Alt-Svc |
| `cors(url)` | CORS-заголовки |
| `cookies(url)` | Secure, HttpOnly, SameSite |
| `mixed(url)` | Mixed Content |
| `redirects(url)` | Цепочка редиректов |
| `gzip(url)` | GZIP / Brotli сжатие |
| `csp(url)` | Content-Security-Policy директивы |
| `cspEval(url)` | Оценка безопасности CSP |
| `pwa(url)` | PWA-валидация |
| `subdomains(domain)` | Поиск поддоменов |
| `email(domain)` | SPF, DKIM, DMARC |
| `server(url)` | Серверное ПО |
| `pageInfo(url)` | Мета-информация |
| `cdn(url)` | Определение CDN |
| `schema(url)` | JSON-LD / Schema.org |
| `whois(domain)` | WHOIS / RDAP |
| `preview(url)` | Open Graph / Link Preview |
| `sri(url)` | SRI-валидация |
| `sriGen(url, algo?)` | SRI-генерация |
| `methods(url)` | HTTP-методы |
| `contrast(fg, bg, size?)` | WCAG-контраст |
| `encode(input, type?)` | Base64 / URL кодирование |
| `decode(input, type?)` | Base64 / URL декодирование |
| `hash(input, algo?)` | SHA-1/256/384/512 |
| `jwt(token)` | Декодирование JWT |
| `pretty(input, type?)` | JSON / XML форматирование |
| `ping(url)` | Проверка доступности |
| `monitor(urls[])` | Мониторинг нескольких URL |

</details>

### CLI

```bash
npx secheaders scan https://example.com
npx secheaders dns google.com A,MX
npx secheaders jwt eyJhbGciOiJIUzI1NiIs...
npx secheaders email google.com
```

---

## 🚀 Быстрый старт

```bash
git clone https://github.com/bitplugg/secheaders
cd secheaders
yarn install
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000).

---

## 🧱 Архитектура

```
secheaders/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Лендинг
│   │   ├── layout.tsx            # Корневой layout (навбар, тема, i18n, toast)
│   │   ├── tools/page.tsx        # Все инструменты + сканер
│   │   ├── monitor/page.tsx      # Мониторинг сайтов
│   │   ├── report/page.tsx       # PDF/HTML отчёт
│   │   ├── api-docs/page.tsx     # OpenAPI документация
│   │   ├── docs/page.tsx         # Легаси API docs
│   │   ├── globals.css           # Анимации, glass-эффекты, скелетоны
│   │   ├── not-found.tsx         # 404 страница
│   │   ├── api/                  # 47 Edge-эндпоинтов
│   │   │   ├── scan/route.ts     # HTTP-заголовки
│   │   │   ├── dns/route.ts      # DNS через Cloudflare DoH
│   │   │   ├── ssl/route.ts      # SSL/TLS
│   │   │   └── ...
│   │   └── [page]/               # 55 страниц инструментов
│   └── components/               # React-компоненты
│       ├── ScanForm.tsx          # Форма ввода URL
│       ├── ScoreBadge.tsx        # Оценка A-F
│       ├── Toast.tsx             # Уведомления
│       ├── I18nProvider.tsx      # Интернационализация
│       ├── ThemeToggle.tsx       # Тёмная/светлая тема
│       └── ...
├── packages/
│   └── secheaders/               # npm-пакет
│       ├── src/
│       │   ├── index.ts          # Класс SecHeaders (32 метода)
│       │   ├── types.ts          # TypeScript-типы
│       │   ├── client.ts         # HTTP-клиент
│       │   └── cli.ts            # CLI-бинарник
│       ├── package.json
│       └── README.md
├── chrome-extension/             # Chrome Extension
│   ├── manifest.json
│   ├── popup.html
│   └── popup.js
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # CI: lint + typecheck + build
│   │   └── publish-sdk.yml       # npm publish по тегу
│   └── dependabot.yml            # Автообновление зависимостей
├── Dockerfile                    # Multi-stage сборка
├── public/
│   ├── openapi.json              # OpenAPI 3.0 спецификация
│   └── manifest.json             # PWA manifest
└── src/lib/
    ├── headers.ts                # Движок оценки заголовков (A-F)
    ├── types.ts                  # TypeScript-типы
    ├── export.ts                 # JSON / YAML экспорт
    ├── rate-limit.ts             # Rate limiter
    └── api-key.ts                # API-ключи
```

---

## 🔌 API-эндпоинты

Все 47 API работают на **Edge Runtime**. Параметры передаются через query string.

| Endpoint | Описание |
|---|---|
| `GET /api/scan?url=` | 🛡️ HTTP-заголовки безопасности (A–F) |
| `GET /api/batch?urls=` | 📋 Массовое сканирование (до 10 URL) |
| `GET /api/compare?a=&b=` | ⚖️ Сравнение двух сайтов |
| `GET /api/dns?domain=&types=` | 🌐 DNS-записи через Cloudflare DoH |
| `GET /api/ssl?url=` | 🔐 SSL / HTTPS / HSTS |
| `GET /api/tls?url=` | 🔏 HTTP/2, HTTP/3, Alt-Svc |
| `GET /api/cors?url=` | 🌍 CORS-заголовки |
| `GET /api/cookies?url=` | 🍪 Cookie-безопасность |
| `GET /api/mixed?url=` | ⚠️ Mixed Content |
| `GET /api/redirects?url=` | ↪️ Цепочка редиректов |
| `GET /api/gzip?url=` | 📦 GZIP / Brotli |
| `GET /api/csp-dump?url=` | 🔒 Content-Security-Policy |
| `GET /api/csp-eval?url=` | 🔍 Оценка CSP |
| `GET /api/pwa?url=` | 📱 PWA-валидация |
| `GET /api/subdomains?domain=` | 🔍 Поиск поддоменов |
| `GET /api/email-security?domain=` | 📧 SPF/DKIM/DMARC |
| `GET /api/server?url=` | 🖥️ Серверное ПО |
| `GET /api/page-info?url=` | ℹ️ Мета-информация |
| `GET /api/cdn?url=` | 🌍 Определение CDN |
| `GET /api/schema?url=` | 📊 JSON-LD / Schema.org |
| `GET /api/whois?domain=` | 📋 WHOIS / RDAP |
| `GET /api/preview?url=` | 🔗 Open Graph / Link Preview |
| `GET /api/sri?url=` | ✅ SRI-валидация |
| `GET /api/sri-gen?url=&algorithm=` | 🔑 SRI-генерация |
| `GET /api/methods?url=` | 🔧 HTTP-методы |
| `GET /api/contrast?foreground=&background=` | 👁️ WCAG-контраст |
| `GET /api/encode?input=&action=&type=` | 🔤 Base64/URL encode/decode |
| `GET /api/hash?input=&algorithm=` | 🔑 SHA-хеширование |
| `GET /api/jwt?token=` | 🧩 Декодирование JWT |
| `GET /api/pretty?input=&type=` | 🎨 JSON/XML форматирование |
| `GET /api/ping?url=` | 📡 Проверка доступности |
| `GET /api/monitor?urls=` | 📊 Мониторинг нескольких URL |
| `GET /api/pdf?url=` | 📄 HTML-отчёт |
| `GET /api/broken-links?url=` | 🔗 Битые ссылки |
| `GET /api/clone?url=` | 🪞 Поиск клонов |
| `GET /api/deps?url=` | 📦 JS-библиотеки / CMS |
| `GET /api/diff?a=&b=` | 📊 HTTP-diff |
| `GET /api/favicon?url=` | 🖼️ Favicon |
| `GET /api/feed?url=` | 📢 RSS/Atom |
| `GET /api/meta?url=` | 🏷️ SEO-метатеги |
| `GET /api/sitemap?url=` | 🗺️ Sitemap.xml |
| `GET /api/ssrf?url=` | 🛡️ SSRF-проверка |
| `GET /api/validator?url=` | ✅ HTML-валидация |
| `GET /api/wayback?url=` | 🕰️ Archive.org |
| `GET /api/well-known?url=` | 📄 .well-known |
| `GET /api/wp?url=` | 🔌 WordPress сканер |
| `GET /api/prefetch?url=` | ⚡ Prefetch-заголовки |

---

## ⚙️ Технологии

| Технология | Назначение |
|---|---|
| **Next.js 16** | App Router, SSR, SSG, Edge Runtime |
| **TypeScript** | Полная типизация |
| **Tailwind CSS** | Стилизация, адаптивность |
| **Edge Runtime** | Все API работают на Vercel Edge |
| **Cloudflare DoH** | DNS-запросы через DNS-over-HTTPS |
| **crt.sh** | Поиск поддоменов |
| **RDAP** | WHOIS-данные |
| **W3C Validator** | HTML-валидация |
| **Archive.org** | Wayback Machine |
| **tsup** | Сборка npm-пакета |

---

## ✨ Возможности

- ✅ **48 инструментов** на одном сайте
- ✅ **47 API** на Edge Runtime — мгновенные ответы
- ✅ **Оценка A–F** по 11 security-заголовкам
- ✅ **npm-пакет** `secheaders` — 32 метода, полная типизация
- ✅ **CLI** — `npx secheaders scan example.com`
- ✅ **Chrome Extension** — проверка в один клик
- ✅ **Docker** — multi-stage сборка `docker build -t secheaders .`
- ✅ **Мониторинг** — проверка до 20 сайтов разом
- ✅ **PDF/HTML отчёт** — скачать и распечатать
- ✅ **PWA** — установка как приложение
- ✅ **Тёмная тема** — авто + переключение
- ✅ **i18n** — RU / EN
- ✅ **Rate limiting** — 100 запросов/мин
- ✅ **API Keys** — аутентификация через `x-api-key`
- ✅ **OpenAPI 3.0** — полная спецификация
- ✅ **GitHub Actions** — CI + autopublish npm
- ✅ **Dependabot** — автообновление зависимостей

---

## 🚢 Деплой

### Vercel (рекомендуется)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bitplugg/secheaders)

```bash
npx vercel --prod
```

### Docker

```bash
docker build -t secheaders .
docker run -p 3000:3000 secheaders
```

---

## 📄 CLI-справка

```bash
npx secheaders

  scan    <url>              Сканировать заголовки
  dns     <domain> [types]   DNS-запрос
  ssl     <url>              SSL / HTTPS
  tls     <url>              TLS / HTTP/2
  cors    <url>              CORS
  csp     <url>              CSP-анализ
  whois   <domain>           WHOIS
  email   <domain>           SPF/DKIM/DMARC
  ping    <url>              Доступность
  hash    <string> [algo]    SHA
  jwt     <token>            JWT-декодирование
  preview <url>              Open Graph
  batch   <url1,url2,...>    Массовое сканирование
```

---

## 🌐 Chrome Extension

Папка `chrome-extension/` — загрузите в `chrome://extensions` в режиме разработчика:

1. Откройте `chrome://extensions`
2. Включите «Режим разработчика»
3. «Загрузить распакованное расширение» → выберите `chrome-extension/`
4. Нажмите на иконку расширения на любой странице

---

## 🔐 Переменные окружения

| Переменная | Описание |
|---|---|
| `API_KEYS` | Ключи доступа к API через `x-api-key` (через запятую) |

---

## 🤝 Вклад в проект

PRs приветствуются!

1. Форкните репозиторий
2. Создайте ветку: `git checkout -b feature/my-feature`
3. Закоммитьте: `git commit -am 'Add feature'`
4. Запушьте: `git push origin feature/my-feature`
5. Откройте Pull Request

---

<div align="center">
  <p>
    <strong>SecHeaders</strong> — Open Source Web Security Toolkit<br/>
    <a href="https://zxc-r1spclf9a-bitplugg.vercel.app">🌐 Демо</a> ·
    <a href="https://github.com/bitplugg/secheaders">📦 GitHub</a> ·
    <a href="https://www.npmjs.com/package/secheaders">📦 npm</a> ·
    <a href="https://zxc-r1spclf9a-bitplugg.vercel.app/api-docs">📖 API Docs</a>
  </p>
  <p>
    <sub>MIT © 2026 bitplugg</sub>
  </p>
</div>
