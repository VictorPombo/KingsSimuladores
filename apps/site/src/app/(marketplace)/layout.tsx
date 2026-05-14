import { Header } from '@/components/marketplace/layout/Header'
import { Footer } from '@/components/marketplace/layout/Footer'
import { ToastProvider } from '@kings/ui'
import { CartProvider } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/store/cart/CartDrawer'
import { VisitTracker } from '@/components/shared/VisitTracker'
import { MaintenanceBanner } from '@/components/shared/MaintenanceBanner'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <CartProvider>
        <VisitTracker origin="msu" />
        <CartDrawer />
        <div className="theme-msu" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <MaintenanceBanner />
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </ToastProvider>
  )
}
