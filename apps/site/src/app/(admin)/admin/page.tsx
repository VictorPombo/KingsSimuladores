import { Card, Container, Badge } from '@kings/ui'
import { createServerSupabaseClient, createAdminClient } from '@kings/db/server'
import Link from 'next/link'
import { MetricasCard } from './components/MetricasCard'
import { TrendingUp, Clock, MoveRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react'


import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ searchParams }: { searchParams: { tab?: string } }) {
  const storeCookie = cookies().get('admin_store')?.value || 'all'
  // Compatibilidade com tabs antigas se existirem
  const currentStore = searchParams.tab || storeCookie

  const isMsuTab = currentStore === 'msu'
  const isSevenTab = currentStore === 'seven'
  const isKingsTab = currentStore === 'kings'
  const isAllTab = currentStore === 'all'
  
  let stats = { orders: 0, productsOrListings: 0, users: 0, metric4: 0, revenue: 0 }
  let recentOrders: any[] = []

  try {
    const supabase = createAdminClient()
    
    if (isMsuTab) {
      // MSU MARKETPLACE STATS
      const [mOrdersRes, mListingsRes, mPendingRes, revenueRes] = await Promise.all([
        supabase.from('marketplace_orders').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('marketplace_orders').select('total_price')
      ])
      
      const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0

      stats = {
        orders: mOrdersRes.count || 0,
        productsOrListings: mListingsRes.count || 0,
        users: 0, // Poderia ser sellers count no futuro
        metric4: mPendingRes.count || 0, // Pendentes
        revenue: totalRevenue,
      }

      const { data: latest } = await supabase
        .from('marketplace_orders')
        .select('id, total_price, status, created_at, profiles!marketplace_orders_buyer_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)
        
      if (latest) recentOrders = latest.map(o => ({
        id: o.id,
        total: o.total_price,
        status: o.status,
        created_at: o.created_at,
        client: Array.isArray(o.profiles) ? o.profiles[0]?.full_name : (o.profiles as any)?.full_name || 'Comprador'
      }))

    } else {
      // KINGS STORE / SEVEN / ALL STATS
      let ordersQuery = supabase.from('orders').select('id', { count: 'exact', head: true })
      let productsQuery = supabase.from('products').select('id', { count: 'exact', head: true })
      let revenueQuery = supabase.from('orders').select('total').eq('status', 'paid')
      let latestQuery = supabase.from('orders').select('id, total, status, created_at, brand_origin, profiles(full_name)').order('created_at', { ascending: false }).limit(5)

      if (isKingsTab || isSevenTab) {
        const brandName = isKingsTab ? 'kings' : 'seven'
        ordersQuery = ordersQuery.eq('brand_origin', brandName)
        revenueQuery = revenueQuery.eq('brand_origin', brandName)
        latestQuery = latestQuery.eq('brand_origin', brandName)
        
        // Fetch real UUID for products table brand_id
        const { data: brand } = await supabase.from('brands').select('id').eq('name', brandName).single()
        if (brand) {
          productsQuery = productsQuery.eq('brand_id', brand.id)
        }
      }

      const [ordersRes, productsRes, usersRes, revenueRes] = await Promise.all([
        ordersQuery,
        productsQuery,
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        revenueQuery
      ])
      
      const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      stats = {
        orders: ordersRes.count || 0,
        productsOrListings: productsRes.count || 0,
        users: usersRes.count || 0,
        metric4: 0,
        revenue: totalRevenue,
      }

      const { data: latest } = await latestQuery
        
      if (latest) recentOrders = latest.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
        brand: o.brand_origin,
        client: Array.isArray(o.profiles) ? o.profiles[0]?.full_name : (o.profiles as any)?.full_name || 'Anônimo'
      }))
    }

  } catch (err) {
    console.error("Dashboard error:", err)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(6, 8, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 0',
        }}
      >
        <Container>
          <div className="admin-header-flex">
            <h1
              className="gradient-text"
              style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}
            >
              KINGS HUB — ADMIN
            </h1>
            <Badge variant="warning">Apenas Administradores</Badge>
          </div>
        </Container>
      </header>

      <section style={{ padding: '40px 0' }}>
        <Container style={{ maxWidth: '1400px' }}>


          <div className="admin-header-flex" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#f8fafc', margin: 0 }}>
              {isMsuTab ? 'Visão Geral C2C (MSU)' : isSevenTab ? 'Visão Corporativa (Seven Sim Racing)' : isAllTab ? 'Visão Global de Todas as Lojas' : 'Visão Corporativa (Kings Store)'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Atualizado em tempo real</div>
          </div>

          {/* NOVA VISÃO DE MÉTRICAS */}
          <MetricasCard />


          {/* CRM LATEST ORDERS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#f8fafc', margin: 0 }}>
              Radar de Pedidos Recentes
            </h2>
            <Link href="/admin/pedidos" style={{ fontSize: '0.8rem', color: isMsuTab ? '#06b6d4' : '#10b981', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todos <MoveRight size={14} />
            </Link>
          </div>
          
          <div className="admin-overflow-table" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>Pedido</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>Cliente</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px' }}>Pagamento</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '1px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '32px 24px', textAlign: 'center', color: '#64748b' }}><Clock size={24} style={{ margin: '0 auto 8px', opacity: 0.3}} />Nenhuma transação recente no radar.</td></tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} className="hover:bg-[#1e293b]">
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', fontSize: '0.8rem' }}>#{o.id.split('-')[0].toUpperCase()}</td>
                      <td style={{ padding: '16px 24px', color: '#e2e8f0', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {o.client.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {o.client}
                            {o.brand === 'seven' && <span style={{ fontSize: '0.65rem', color: '#facc15', fontWeight: 700 }}>SEVEN</span>}
                            {o.brand === 'kings' && <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>KINGS</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                          background: o.status === 'paid' || o.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: o.status === 'paid' || o.status === 'completed' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${o.status === 'paid' || o.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {o.status === 'paid' ? 'PAGO' : o.status === 'pending' ? 'AGUARDANDO' : o.status?.toUpperCase() || 'DESCONHECIDO'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.8rem' }}>Pix</td>
                      <td style={{ padding: '16px 24px', color: isMsuTab ? '#06b6d4' : '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </section>
    </div>
  )
}
