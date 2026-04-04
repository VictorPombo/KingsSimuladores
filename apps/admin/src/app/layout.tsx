import type { Metadata } from 'next'
import '@kings/ui/globals.css'

export const metadata: Metadata = {
  title: 'Kings Hub — Painel Administrativo',
  description: 'Painel de gestão unificado Kings Simuladores + Meu Simulador Usado',
  robots: 'noindex, nofollow',
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
