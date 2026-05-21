import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const PATTERNS: Array<{ name: string; urlPattern: RegExp; detectInScript?: string[] }> = [
  { name: 'React', urlPattern: /\/react(?:\.min)?\.js/ },
  { name: 'React (esm)', urlPattern: /\/react\/umd\// },
  { name: 'Vue', urlPattern: /\/vue(?:\.min)?\.js/ },
  { name: 'Vue 3', urlPattern: /\/vue\.global(?:\.prod)?\.js/ },
  { name: 'Angular', urlPattern: /\/angular(?:\.min)?\.js/ },
  { name: 'jQuery', urlPattern: /\/jquery(?:\.min)?\.js/ },
  { name: 'Bootstrap CSS', urlPattern: /\/bootstrap(?:\.min)?\.css/ },
  { name: 'Bootstrap JS', urlPattern: /\/bootstrap(?:\.bundle)?(?:\.min)?\.js/ },
  { name: 'Tailwind', urlPattern: /\/tailwindcss/ },
  { name: 'Alpine.js', urlPattern: /\/alpinejs/ },
  { name: 'HTMX', urlPattern: /\/htmx(?:\.min)?\.js/ },
  { name: 'Next.js', urlPattern: /\/_next\// },
  { name: 'Nuxt', urlPattern: /\/_nuxt\// },
  { name: 'Gatsby', urlPattern: /\/gatsby/ },
  { name: 'Svelte', urlPattern: /\/svelte/ },
  { name: 'Drupal', urlPattern: /\/core\/misc\/drupal/ },
  { name: 'WordPress', urlPattern: /\/wp-(?:content|includes)\// },
  { name: 'Laravel', urlPattern: /\/laravel/ },
  { name: 'Socket.io', urlPattern: /\/socket\.io\// },
  { name: 'D3.js', urlPattern: /\/d3(?:\.min)?\.js/ },
  { name: 'Chart.js', urlPattern: /\/chart(?:\.min)?\.js/ },
  { name: 'Lodash', urlPattern: /\/lodash(?:\.min)?\.js/ },
  { name: 'Moment.js', urlPattern: /\/moment(?:\.min)?\.js/ },
  { name: 'Font Awesome', urlPattern: /\/font-awesome/ },
  { name: 'Google Analytics', urlPattern: /\/analytics\.js|googletagmanager/ },
  { name: 'Facebook Pixel', urlPattern: /\/fbq\b|connect\.facebook/ },
  { name: 'Cloudflare', urlPattern: /\/cdn-cgi\// },
]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ success: false, error: 'url required' }, { status: 400 })

  let target = url
  if (!target.startsWith('http')) target = 'https://' + target

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target, { signal: controller.signal, redirect: 'follow', headers: { 'User-Agent': 'SecHeaders/1.0' } })
    clearTimeout(timeout)
    const html = await res.text()

    const scripts: string[] = []
    const srcRe = /<script[\s>][\s\S]*?src=["']([^"']+)["']/gi
    let m
    while ((m = srcRe.exec(html)) !== null) scripts.push(m[1])

    const links: string[] = []
    const hrefRe = /<link[\s>][\s\S]*?href=["']([^"']+)["']/gi
    while ((m = hrefRe.exec(html)) !== null) links.push(m[1])

    const allUrls = [...scripts, ...links]
    const detected: Array<{ name: string; match: string }> = []

    for (const lib of PATTERNS) {
      const match = allUrls.find(u => lib.urlPattern.test(u))
      if (match) detected.push({ name: lib.name, match })
    }

    // Detect from HTML patterns
    if (html.includes('__NEXT_DATA__')) { if (!detected.find(d => d.name === 'Next.js')) detected.push({ name: 'Next.js', match: '__NEXT_DATA__' }) }
    if (html.includes('__NUXT__')) { if (!detected.find(d => d.name === 'Nuxt')) detected.push({ name: 'Nuxt', match: '__NUXT__' }) }
    if (/data-react-root/i.test(html)) { if (!detected.find(d => d.name === 'React')) detected.push({ name: 'React', match: 'data-react-root attribute' }) }
    if (/ng-version/i.test(html)) { if (!detected.find(d => d.name === 'Angular')) detected.push({ name: 'Angular', match: 'ng-version attribute' }) }
    if (/vue-app|__vue__/i.test(html)) { if (!detected.find(d => d.name === 'Vue')) detected.push({ name: 'Vue', match: 'vue-app marker' }) }
    if (/wp-content/i.test(html)) { if (!detected.find(d => d.name === 'WordPress')) detected.push({ name: 'WordPress', match: 'wp-content path' }) }
    if (/data-controller/i.test(html) && /\sx-data\s/i.test(html)) { if (!detected.find(d => d.name === 'Alpine.js')) detected.push({ name: 'Alpine.js', match: 'x-data attribute' }) }

    return NextResponse.json({ success: true, data: { url: target, detected } })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
