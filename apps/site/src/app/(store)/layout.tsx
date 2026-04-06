import { Header } from '@/components/store/layout/Header'
import { Footer } from '@/components/store/layout/Footer'
import { CartProvider } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/store/cart/CartDrawer'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <CartDrawer />
      <Header />
      {children}
      <Footer />
    </CartProvider>
  )
}
