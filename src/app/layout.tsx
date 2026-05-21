'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from '@/components/ThemeToggle'
import { ToastProvider } from '@/components/Toast'
import { BackToTop } from '@/components/BackToTop'

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'Tools' },
  { href: '/batch', label: 'Batch' }, { href: '/compare', label: 'Compare' },
  { href: '/mixed', label: 'Mixed' }, { href: '/redirects', label: 'Redirects' }, { href: '/gzip', label: 'GZIP' },
  { href: '/csp', label: 'CSP' }, { href: '/csp-eval', label: 'CSP Eval' },
  { href: '/ssl', label: 'SSL' }, { href: '/tls', label: 'TLS' },
  { href: '/cors', label: 'CORS' }, { href: '/cookies', label: 'Cookies' },
  { href: '/dns', label: 'DNS' }, { href: '/whois', label: 'WHOIS' },
  { href: '/email-security', label: 'Email' }, { href: '/subdomains', label: 'Subdomains' },
  { href: '/sri', label: 'SRI' }, { href: '/sri-gen', label: 'SRI Gen' },
  { href: '/server', label: 'Server' }, { href: '/page-info', label: 'PageInfo' },
  { href: '/schema', label: 'Schema' }, { href: '/social-preview', label: 'Social' },
  { href: '/preview', label: 'Preview' }, { href: '/meta', label: 'Meta' },
  { href: '/sitemap', label: 'Sitemap' }, { href: '/methods', label: 'Methods' },
  { href: '/broken-links', label: 'Links' }, { href: '/feed', label: 'Feeds' },
  { href: '/favicon', label: 'Favicon' }, { href: '/cdn', label: 'CDN' },
  { href: '/pwa', label: 'PWA' }, { href: '/deps', label: 'Deps' },
  { href: '/clone', label: 'Clone' }, { href: '/ssrf', label: 'SSRF' }, { href: '/wp', label: 'WP' },
  { href: '/contrast', label: 'Contrast' }, { href: '/validator', label: 'HTML' },
  { href: '/wayback', label: 'Wayback' }, { href: '/diff', label: 'Diff' },
  { href: '/jwt', label: 'JWT' }, { href: '/well-known', label: '.well-known' },
  { href: '/history', label: 'History' }, { href: '/history-chart', label: 'Chart' },
  { href: '/pretty', label: 'Pretty' }, { href: '/encode', label: 'Encode' },
  { href: '/hash', label: 'Hash' }, { href: '/docs', label: 'API' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches))
      document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [mobileOpen])

  return (
    <html lang="ru" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <title>SecHeaders — Web Security Toolkit</title>
        <meta name="description" content="Набор инструментов для анализа безопасности веб-сайтов." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ToastProvider>
          <header className="glass sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <a href="/" className="font-bold text-lg tracking-tight shrink-0 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl gradient-header flex items-center justify-center text-white text-sm font-bold float-anim">S</span>
                <span className="hidden sm:inline">SecHeaders</span>
              </a>
              <nav className="hidden lg:flex items-center gap-1 overflow-x-auto text-sm no-scrollbar">
                {NAV.map(item => (
                  <a key={item.href} href={item.href}
                    className={`px-2 py-1 rounded-md transition whitespace-nowrap ${pathname === item.href ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {item.label}
                  </a>
                ))}
                <ThemeToggle />
              </nav>
              <div className="flex lg:hidden items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Menu">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                  </svg>
                </button>
              </div>
            </div>
            <div className={`lg:hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'mobile-nav-open' : 'mobile-nav-closed'}`}>
              <div className="px-4 pb-4 flex flex-col gap-1 text-sm max-h-[70vh] overflow-y-auto">
                {NAV.map(item => (
                  <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-md transition ${pathname === item.href ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <BackToTop />
          <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500">
            <p className="font-medium text-sm mb-1">SecHeaders — Web Security Toolkit</p>
            <p>{NAV.length} инструментов • Все на Edge Runtime • Готов к деплою на Vercel</p>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
