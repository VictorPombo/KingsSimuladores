import type { Metadata, Viewport } from 'next'
import '@kings/ui/globals.css'

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
  icons: {
    icon: 'https://cdn.awsli.com.br/1940/1940182/favicon/design_sem_nome-removebg-preview-1-ankxhcnbfi.png',
    shortcut: 'https://cdn.awsli.com.br/1940/1940182/favicon/design_sem_nome-removebg-preview-1-ankxhcnbfi.png',
    apple: 'https://cdn.awsli.com.br/1940/1940182/favicon/design_sem_nome-removebg-preview-1-ankxhcnbfi.png',
  },
}

import { StreamingBackground } from '@kings/ui'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
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
