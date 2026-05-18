import { Header } from '@/components/marketplace/layout/Header'
import { Footer } from '@/components/marketplace/layout/Footer'
import { ToastProvider } from '@kings/ui'
import { CartProvider } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/store/cart/CartDrawer'
import { VisitTracker } from '@/components/shared/VisitTracker'
import { MaintenanceBanner } from '@/components/shared/MaintenanceBanner'
import { UnderDevelopmentPopup } from '@/components/shared/UnderDevelopmentPopup'

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
        <UnderDevelopmentPopup
          store="msu"
          redirectUrl="https://meusimuladorusado.com.br/"
          redirectLabel="Ir para Meu Simulador Usado"
          accentColor="#06b6d4"
          logoSrc="/logo_msu.png"
          storeName="Meu Simulador Usado"
        />
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
