'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastCtx {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function useToast() { return useContext(Ctx) }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  let nextId = 0

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = nextId++
    setItems(prev => [...prev, { id, message, type }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {items.map(t => (
          <div key={t.id} className={`animate-slide-up px-4 py-3 rounded-lg shadow-lg text-sm text-white ${
            t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
