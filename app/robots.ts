import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/profile/',
        '/messages/',
        '/notifications',
        '/payment/',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: 'https://bebaby.app/sitemap.xml',
  }
} 