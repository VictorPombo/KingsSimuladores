import type { Metadata } from 'next'
import './globals.css'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export const metadata: Metadata = {
  title: 'Meu Simulador Usado — Classificados de Automobilismo Virtual',
  description: 'O maior marketplace comunitário para comprar e vender equipamentos de simulador de corrida usados.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
