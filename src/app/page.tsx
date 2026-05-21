'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('opacity-100', 'translate-y-0') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700')
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20 pointer-events-none" />

        <div className="animate-fade-in space-y-6 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
            Открытый инструментарий • 48 инструментов
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Web Security
            </span>
            <br />
            <span>Toolkit</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Полный набор инструментов для анализа безопасности веб-сайтов.
            HTTP-заголовки, CSP, SSL, TLS, DNS, CORS, WHOIS и многое другое.
            Всё работает на Edge Runtime — быстро, бесплатно, без серверной инфраструктуры.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/tools"
              className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              <span className="relative z-10">Начать работу</span>
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              GitHub →
            </a>
          </div>
        </div>

        <div className="mt-16 animate-float">
          <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 space-y-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🛡️', title: 'Security Headers', desc: 'Анализ HSTS, CSP, X-Frame-Options, COOP, COEP и 10+ других заголовков с оценкой A–F.' },
            { icon: '🔐', title: 'SSL / TLS', desc: 'Проверка HTTPS, HSTS, HTTP/2, HTTP/3, Alt-Svc и цепочки редиректов.' },
            { icon: '🌐', title: 'DNS & Domains', desc: 'A, AAAA, MX, TXT, NS, CNAME — через Cloudflare DoH. WHOIS через RDAP.' },
            { icon: '📧', title: 'Email Security', desc: 'SPF, DKIM, DMARC — проверка почтовой безопасности домена.' },
            { icon: '🔍', title: 'Subdomains & CDN', desc: 'Поиск поддоменов через crt.sh. Определение Cloudflare, Fastly, Akamai.' },
            { icon: '📄', title: 'Content & SEO', desc: 'Open Graph, JSON-LD, Sitemap, RSS, Meta-теги, Favicon, W3C HTML.' },
          ].map((item, i) => (
            <div key={i} className={`reveal p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl card-hover`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold">Готов к работе</h2>
          <p className="text-blue-100 text-lg">48 инструментов, 37 API-эндпоинтов, всё на Edge Runtime.</p>
          <Link
            href="/tools"
            className="inline-block mt-4 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl text-lg hover:bg-blue-50 transition-all hover:shadow-xl"
          >
            Перейти к инструментам
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20 space-y-6">
        <h2 className="text-2xl font-bold text-center reveal">Как это работает</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Введите URL', desc: 'Укажите адрес сайта для анализа' },
            { step: '2', title: 'Выберите инструмент', desc: 'Сканирование заголовков, DNS, SSL и другие проверки' },
            { step: '3', title: 'Получите отчёт', desc: 'Оценка A–F, детальный разбор и экспорт в JSON/YAML' },
          ].map((item, i) => (
            <div key={i} className="reveal text-center p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 text-center border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500">
          SecHeaders — Open Source Web Security Toolkit. Все инструменты работают на Edge Runtime.
        </p>
      </section>
    </div>
  )
}
