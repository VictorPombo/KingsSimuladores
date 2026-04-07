import { Header } from '@/components/marketplace/layout/Header'
import { Footer } from '@/components/marketplace/layout/Footer'
import { ToastProvider } from '@kings/ui'

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="theme-msu" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  )
}
