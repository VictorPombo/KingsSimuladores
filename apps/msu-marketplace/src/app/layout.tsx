import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '../components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Meu Simulador Usado',
  description: 'Comunidade SIMRACING de Usados.',
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
      <body style={{ display: 'flex', justifyContent: 'center', background: '#030509', margin: 0, padding: 0 }}>
        <main style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px', 
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.05)',
          borderLeft: '1px solid rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.03)',
          overflowX: 'hidden'
        }}>
          <div style={{ paddingBottom: '90px' }}>
            {children}
          </div>
          <BottomNav />
        </main>
      </body>
    </html>
  )
}
