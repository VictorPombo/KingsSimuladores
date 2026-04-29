import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import { Container } from '@kings/ui'
import { formatPrice } from '@kings/utils'
import { OrderStatusBadge } from '@/components/store/account/OrderStatusBadge'

export const dynamic = 'force-dynamic'

export default async function AccountPage({ searchParams }: { searchParams: { order?: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
    .select('*')
    .eq('customer_id', profile?.id || user.id)
    .order('created_at', { ascending: false })

  // If no DB orders (since we might be mocking the checkout step locally), use a dummy active order
  const displayOrders = orders && orders.length > 0 ? orders : [
    {
      id: searchParams.order || 'mock-order-id-123',
      created_at: new Date().toISOString(),
      status: 'paid',
      total: 3950.00,
      tracking_code: 'BR123456789XX',
    }
  ]

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', color: '#fff' }}>
      <Container>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: '#00e5ff' }}>Sua Garagem</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Area: Orders */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#a1a1aa' }}>Meus Pedidos</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayOrders.map((order: any) => (
                <div key={order.id} style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Pedido</div>
                      <div style={{ fontFamily: 'monospace' }}>#{order.id.split('-')[0]}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Data</div>
                      <div>{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Total</div>
                      <div style={{ color: '#00e5ff', fontWeight: 600 }}>{formatPrice(order.total)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Status</div>
                      <OrderStatusBadge orderId={order.id} initialStatus={order.status} />
                    </div>
                  </div>
                  
                  {order.tracking_code && (
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '0.9rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Código de Rastreio (Frenet)</div>
                      <div style={{ fontWeight: 600, letterSpacing: '2px' }}>{order.tracking_code}</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.25rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Puxar Nota Fiscal (PDF)
                    </button>
                    <button style={{ background: 'transparent', border: '1px solid #00e5ff', padding: '0.5rem 1rem', borderRadius: '0.25rem', color: '#00e5ff', cursor: 'pointer', fontSize: '0.9rem' }}>
                      Atendimento
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
          
          {/* Sidebar: Profile */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#a1a1aa' }}>Meu Perfil</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#a1a1aa', display: 'block' }}>Nome</span>
                {(profile as any)?.full_name || 'Piloto'}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#a1a1aa', display: 'block' }}>E-mail</span>
                {user.email}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <span style={{ color: '#a1a1aa', display: 'block' }}>Chave UID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.id.split('-')[0]}***</span>
              </div>
            </div>
            
            <button style={{ width: '100%', marginTop: '2rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '0.25rem', cursor: 'pointer' }}>
              Sair
            </button>
          </div>

        </div>
      </Container>
    </div>
  )
}
