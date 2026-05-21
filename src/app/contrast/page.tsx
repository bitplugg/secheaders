'use client'

import { useState } from 'react'

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

function luminance(r: number, g: number, b: number) {
  const [R, G, B] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrastRatio(c1: string, c2: string) {
  const a = hexToRgb(c1), b = hexToRgb(c2)
  const l1 = luminance(a.r, a.g, a.b), l2 = luminance(b.r, b.g, b.b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

export default function ContrastPage() {
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const ratio = contrastRatio(fg, bg)
  const aa = ratio >= 4.5
  const aaa = ratio >= 7
  const largeAa = ratio >= 3

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Color Contrast Checker</h1>
      <p className="text-gray-500">Проверка контрастности WCAG AA/AAA (client-side)</p>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-gray-400">Текст</label><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-full h-12 rounded-lg cursor-pointer" /></div>
        <div><label className="text-xs text-gray-400">Фон</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-12 rounded-lg cursor-pointer" /></div>
      </div>
      <div className="p-8 rounded-xl text-center text-2xl font-bold border" style={{ color: fg, backgroundColor: bg }}>Sample Text</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-center"><p className="text-xs text-gray-400">Contrast Ratio</p><p className="text-2xl font-bold">{ratio.toFixed(2)}:1</p></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-center"><p className="text-xs text-gray-400">WCAG AA (normal)</p><p className={`text-lg font-bold ${aa ? 'text-emerald-600' : 'text-red-600'}`}>{aa ? 'PASS ✓' : 'FAIL ✗'}</p></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-center"><p className="text-xs text-gray-400">WCAG AAA (normal)</p><p className={`text-lg font-bold ${aaa ? 'text-emerald-600' : 'text-red-600'}`}>{aaa ? 'PASS ✓' : 'FAIL ✗'}</p></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-3 text-center"><p className="text-xs text-gray-400">WCAG AA (large)</p><p className={`text-lg font-bold ${largeAa ? 'text-emerald-600' : 'text-red-600'}`}>{largeAa ? 'PASS ✓' : 'FAIL ✗'}</p></div>
      </div>
    </div>
  )
}
