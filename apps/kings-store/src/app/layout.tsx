import type { Metadata } from 'next'
import '@kings/ui/globals.css'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { CartProvider } from '../contexts/CartContext'
import { CartDrawer } from '../components/cart/CartDrawer'

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
  ],
  openGraph: {
    title: 'Kings Simuladores',
    description: 'Simuladores de Corrida Premium',
    url: 'https://kingssimuladores.com.br',
    siteName: 'Kings Simuladores',
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
      <body>
        <CartProvider>
          <CartDrawer />
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
