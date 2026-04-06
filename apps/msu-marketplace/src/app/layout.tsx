import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '../components/layout/BottomNav'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export const metadata: Metadata = {
  title: 'Meu Simulador Usado',
  description: 'Classificados simracing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body style={{ background: '#030509', margin: 0, padding: 0 }}>
        
        <div className="desktop-only text-center">
          <Header />
        </div>

        <main className="app-container msu-main">
          {children}
        </main>

        <div className="desktop-only">
          <Footer />
        </div>

        <div className="mobile-only">
          <BottomNav />
        </div>

      </body>
    </html>
  )
}
