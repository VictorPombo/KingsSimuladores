import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KingsHub',
    short_name: 'KingsHub',
    description: 'A maior loja de simuladores de corrida do Brasil.',
    start_url: '/',
    display: 'standalone',
    background_color: '#06080f',
    theme_color: '#00e5ff',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
