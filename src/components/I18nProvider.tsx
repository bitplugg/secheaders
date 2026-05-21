'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { Locale } from '@/lib/i18n'
import { locales } from '@/lib/i18n'

type I18nContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ru',
  setLocale: () => {},
  t: (k) => k,
})

export function useI18n() {
  return useContext(I18nContext)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ru')

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    if (typeof window !== 'undefined') localStorage.setItem('locale', l)
  }, [])

  const t = useCallback((key: string): string => {
    return locales[locale]?.[key] || locales['ru']?.[key] || key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function LangToggle() {
  const { locale, setLocale } = useI18n()
  return (
    <button onClick={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
      className="px-2 py-1 rounded-md text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition">
      {locale === 'ru' ? 'EN' : 'RU'}
    </button>
  )
}
