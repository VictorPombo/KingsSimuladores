import type { Metadata } from 'next'
import '@kings/ui/globals.css'
import { CartProvider } from '../contexts/CartContext'
import { CartDrawer } from '../components/cart/CartDrawer'
import { BottomNav } from '../components/layout/BottomNav'
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
      <body style={{ display: 'flex', justifyContent: 'center', background: '#030509' }}>
        <CartProvider>
          <ToastProvider>
            {/* O container principal - Mobile Wrapper */}
            <main style={{
              position: 'relative',
              width: '100%',
              maxWidth: '430px', 
              minHeight: '100vh',
              background: 'var(--bg-primary)',
              boxShadow: '0 0 40px rgba(0, 180, 245, 0.05)',
              borderLeft: '1px solid rgba(255,255,255,0.03)',
              borderRight: '1px solid rgba(255,255,255,0.03)',
              overflowX: 'hidden'
            }}>
              <CartDrawer />
              
              <div style={{ paddingBottom: '90px' }}>
                {children}
              </div>

              {/* Bottom Nav Fixo */}
              <BottomNav />
            </main>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}

