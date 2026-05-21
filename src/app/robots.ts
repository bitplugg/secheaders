import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/docs'] },
    sitemap: 'https://zxc-r1spclf9a-bitplugg.vercel.app/sitemap.xml',
  }
}
