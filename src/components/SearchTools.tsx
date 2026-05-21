'use client'

import { useState, useMemo } from 'react'

interface ToolDef { href: string; label: string; desc: string; icon: string }

export function SearchTools({ tools, onSelect }: { tools: ToolDef[]; onSelect?: () => void }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return tools.filter(t => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q))
  }, [query, tools])

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Найти инструмент..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>
      {filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto animate-scale-in">
          {filtered.map(tool => (
            <a key={tool.href} href={tool.href} onClick={onSelect}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <span>{tool.icon}</span>
              <div>
                <p className="font-medium text-xs">{tool.label}</p>
                <p className="text-[10px] text-gray-500">{tool.desc}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
