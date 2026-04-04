import type { Metadata } from 'next'
import '@kings/ui/globals.css'

export const metadata: Metadata = {
  title: 'Meu Simulador Usado — Marketplace de Simuladores',
  description:
    'Compre e venda simuladores de corrida usados. Cockpits, volantes, pedais e acessórios com garantia de qualidade.',
  keywords: [
    'simulador usado',
    'comprar simulador',
    'vender simulador',
    'cockpit usado',
    'Meu Simulador Usado',
  ],
  openGraph: {
    title: 'Meu Simulador Usado',
    description: 'Marketplace de Simuladores de Corrida',
    url: 'https://meusimuladorusado.com.br',
    siteName: 'Meu Simulador Usado',
    type: 'website',
  },
}

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
      <body>{children}</body>
    </html>
  )
}
