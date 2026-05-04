import type { Metadata, Viewport } from 'next'
import '@kings/ui/globals.css'
import '@/components/store/layout/responsive.css'
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Kings Simuladores — Simuladores de Corrida Premium',
  description:
    'A maior loja de simuladores de corrida do Brasil. Cockpits, volantes, pedais e acessórios das melhores marcas com até 12x sem juros.',
  keywords: [
    'simulador de corrida',
    'cockpit simulador',
    'volante simulador',
    'sim racing',
    'Kings Simuladores',
    'meu simulador usado',
  ],
  openGraph: {
    title: 'Kings Simuladores',
    description: 'Simuladores de Corrida Premium',
    url: 'https://kingssimuladores.com.br',
    siteName: 'Kings Simuladores',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    title: 'KingsHub',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

import { StreamingBackground } from '@kings/ui'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" style={{ backgroundColor: '#06080f' }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StreamingBackground />
        {children}
      </body>
    </html>
  )
}
