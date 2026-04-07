import { AdminSidebar } from './components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1e1e1e' }}>
      <AdminSidebar />
      <main style={{ 
        flex: 1, 
        padding: '24px 32px', 
        background: '#1e1e1e', // fundo compatível com a visão dark da LI
        overflowY: 'auto' 
      }}>
        {children}
      </main>
    </div>
  )
}
