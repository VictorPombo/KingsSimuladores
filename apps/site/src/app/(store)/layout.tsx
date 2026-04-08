import { Header } from '@/components/store/layout/Header'
import { Footer } from '@/components/store/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/store/cart/CartDrawer'
import { ToastProvider } from '@kings/ui'

import { WhatsappFloat } from '@/components/store/layout/WhatsappFloat'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <CartProvider>
        <CartDrawer />
        <Header />
        {children}
        <Footer />
        <WhatsappFloat />
      </CartProvider>
    </ToastProvider>
  )
}
