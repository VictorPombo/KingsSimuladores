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

import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${rajdhani.variable} ${jetbrains.variable}`} style={{ backgroundColor: '#06080f' }}>
      <head>
        {/* Fontes agora gerenciadas nativamente pelo Next.js */}
      </head>
      <body className="font-body">
        <StreamingBackground />
        {children}
      </body>
    </html>
  )
}
