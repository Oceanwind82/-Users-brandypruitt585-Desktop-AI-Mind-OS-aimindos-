import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/(protected)/*'],
    },
    sitemap: 'https://aimindos.com/sitemap.xml',
  }
}
