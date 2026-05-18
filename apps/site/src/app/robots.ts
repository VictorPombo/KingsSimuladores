import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/', '/account/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
