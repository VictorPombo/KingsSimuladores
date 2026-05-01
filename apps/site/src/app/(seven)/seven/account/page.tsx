import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import { Container } from '@kings/ui'
import { formatPrice } from '@kings/utils'
import { OrderStatusBadge } from '@/components/store/account/OrderStatusBadge'
import { SyncInvoiceButton } from '@/components/store/account/SyncInvoiceButton'

export const dynamic = 'force-dynamic'

export default async function SevenAccountPage({ searchParams }: { searchParams: { order?: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/seven/login')
  }

  // Buscar profile para obter o ID correto dos pedidos
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  // Fetch orders usando profile.id (customer_id nos pedidos é profile.id)
  const { data: orders } = await supabase
    .from('orders')
    .select('*, invoices(*)')
    .eq('customer_id', profile?.id || user.id)
    .order('created_at', { ascending: false })

  const displayOrders = orders || []

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', color: '#f8fafc', fontFamily: 'var(--font-sans)' }}>
      <Container>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#ea580c' }}>Painel do Piloto</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Area: Orders */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#94a3b8' }}>Meus Pedidos Seven</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayOrders.map((order: any) => (
                <div key={order.id} style={{ 
                  background: '#0f172a', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pedido</div>
                      <div style={{ fontFamily: 'monospace' }}>#{order.id.split('-')[0]}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Data</div>
                      <div>{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total</div>
                      <div style={{ color: '#ea580c', fontWeight: 600 }}>{formatPrice(order.total)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Status</div>
                      <OrderStatusBadge orderId={order.id} initialStatus={order.status} />
                    </div>
                  </div>
                  
                  {order.tracking_code && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed rgba(234, 88, 12, 0.2)' }}>
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Código de Rastreio (Frenet)</div>
                      <div style={{ fontWeight: 600, letterSpacing: '2px', color: '#f8fafc' }}>{order.tracking_code}</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <SyncInvoiceButton 
                      orderId={order.id} 
                      invoiceId={order.invoices && order.invoices.length > 0 ? order.invoices[0].id : undefined}
                      initialPdfUrl={order.invoices && order.invoices.length > 0 ? order.invoices[0].pdf_url : undefined}
                    />
                    <button style={{ background: 'transparent', border: '1px solid #ea580c', padding: '0.5rem 1rem', borderRadius: '0.25rem', color: '#ea580c', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                      Atendimento Seven
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
          
          {/* Sidebar: Profile */}
          <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#94a3b8' }}>Meu Perfil</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8', display: 'block' }}>Nome</span>
                {(profile as any)?.full_name || 'Piloto'}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8', display: 'block' }}>E-mail</span>
                {user.email}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8', display: 'block' }}>Chave UID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#f8fafc' }}>{user.id.split('-')[0]}***</span>
              </div>
            </div>
            
            <button style={{ width: '100%', marginTop: '2rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.25rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              Sair
            </button>
          </div>

        </div>
      </Container>
    </div>
  )
}
