import type { Metadata } from 'next'
import '@kings/ui/globals.css'
import { CartProvider } from '../contexts/CartContext'
import { CartDrawer } from '../components/cart/CartDrawer'
import { BottomNav } from '../components/layout/BottomNav'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { ToastProvider } from '@kings/ui'

export const metadata: Metadata = {
  title: 'Kings Simuladores',
  description: 'A maior loja de equipamentos simracing.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body style={{ background: '#030509', margin: 0, padding: 0 }}>
        <CartProvider>
          <ToastProvider>
            {/* Header visível apenas no PC */}
            <div className="desktop-only text-center">
              <Header />
            </div>

            {/* Carrinho Universal */}
            <CartDrawer />
            
            {/* O container híbrido - Sem limites no PC, 430px limit no Mobile via CSS */}
            <main className="app-container">
              {children}
            </main>

            {/* Bottom Nav Fixo apenas no Celular */}
            <div className="mobile-only">
              <BottomNav />
            </div>

            {/* Footer apenas no PC */}
            <div className="desktop-only">
              <Footer />
            </div>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}
