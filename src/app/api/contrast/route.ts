import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return null
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function relativeLuminance(r: number, g: number, b: number) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(l1: number, l2: number) {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export async function GET(request: NextRequest) {
  const fgHex = request.nextUrl.searchParams.get('foreground') || '#000000'
  const bgHex = request.nextUrl.searchParams.get('background') || '#ffffff'
  const fontSize = parseFloat(request.nextUrl.searchParams.get('fontSize') || '16')

  const fg = hexToRgb(fgHex)
  const bg = hexToRgb(bgHex)
  if (!fg || !bg) return NextResponse.json({ success: false, error: 'Invalid hex color' }, { status: 400 })

  const l1 = relativeLuminance(fg.r, fg.g, fg.b)
  const l2 = relativeLuminance(bg.r, bg.g, bg.b)
  const ratio = contrastRatio(l1, l2)
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontSize / 16 >= 1.2)

  const aaLarge = ratio >= 3
  const aaNormal = ratio >= 4.5
  const aaaLarge = ratio >= 4.5
  const aaaNormal = ratio >= 7

  return NextResponse.json({
    success: true,
    data: {
      foreground: fgHex,
      background: bgHex,
      contrastRatio: Math.round(ratio * 100) / 100,
      aa: isLargeText ? aaLarge : aaNormal,
      aaa: isLargeText ? aaaLarge : aaaNormal,
      isLargeText,
      fontSize,
    },
  })
}
