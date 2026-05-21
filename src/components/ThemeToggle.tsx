'use client'

import { useCallback } from 'react'

export function ThemeToggle() {
  const toggle = useCallback(() => {
    const html = document.documentElement
    const isDark = html.classList.toggle('dark')
    document.cookie = `theme=${isDark ? 'dark' : 'light'};path=/;max-age=31536000`
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [])

  return (
    <button
      onClick={toggle}
      className="text-sm hover:text-blue-600 transition"
      title="Переключить тему"
    >
      Theme
    </button>
  )
}
