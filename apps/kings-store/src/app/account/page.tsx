import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import { formatPrice } from '@kings/utils'
import { logout } from '../login/actions'

export default async function AccountPage({ searchParams }: { searchParams: { order?: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const displayOrders = orders && orders.length > 0 ? orders : [
    {
      id: searchParams.order || 'mock-order-id-123',
      created_at: new Date().toISOString(),
      status: 'paid',
      total: 3950.00,
      tracking_code: 'BR123456789XX',
    }
  ]

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '20px', paddingBottom: '90px', color: '#fff' }}>
      
      {/* Header Profile Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Sua Garagem</h1>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logado como {(profile as any)?.full_name || 'Piloto'}</div>
        </div>
        <form action={logout}>
          <button type="submit" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            SAIR
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Orders Stack */}
        <section>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>Meus Pedidos</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {displayOrders.map((order: any) => (
              <div key={order.id} style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)', 
                borderRadius: '16px', 
                padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800 }}>#{order.id.split('-')[0]}</div>
                  <div style={{ 
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: order.status === 'paid' ? 'rgba(0, 232, 150, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    color: order.status === 'paid' ? '#00e896' : '#fff'
                  }}>
                    {order.status === 'paid' ? 'PAGO' : order.status.toUpperCase()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Data:<br/><span style={{ color: '#fff', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    Total:<br/><span style={{ color: 'var(--kings-primary)', fontWeight: 800 }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
                
                {order.tracking_code && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px dashed var(--border-accent)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Código de Rastreio</div>
                    <div style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '1rem', color: 'var(--accent)' }}>{order.tracking_code}</div>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button style={{ background: 'var(--bg-secondary)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                    NFe (PDF)
                  </button>
                  <button style={{ background: 'var(--bg-secondary)', border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                    Atendimento
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
