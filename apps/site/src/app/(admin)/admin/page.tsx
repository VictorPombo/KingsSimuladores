import { Card, Container, Badge } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'

import Link from 'next/link'

export default async function AdminDashboard({ searchParams }: { searchParams: { tab?: string } }) {
  const isMsuTab = searchParams.tab === 'msu'
  
  let stats = { orders: 0, productsOrListings: 0, users: 0, metric4: 0, revenue: 0 }
  let recentOrders: any[] = []

  try {
    const supabase = await createServerSupabaseClient()
    
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
        created_at: o.created_at,
        client: Array.isArray(o.profiles) ? o.profiles[0]?.full_name : (o.profiles as any)?.full_name || 'Comprador'
      }))

    } else {
      // KINGS STORE STATS
      const [ordersRes, productsRes, usersRes, revenueRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('brand_origin', 'kings'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('status', 'paid').eq('brand_origin', 'kings')
      ])
      
      const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

      stats = {
        orders: ordersRes.count || 0,
        productsOrListings: productsRes.count || 0,
        users: usersRes.count || 0,
        metric4: 0,
        revenue: totalRevenue,
      }

      const { data: latest } = await supabase
        .from('orders')
        .select('id, total, status, created_at, profiles(full_name)')
        .eq('brand_origin', 'kings')
        .order('created_at', { ascending: false })
        .limit(5)
        
      if (latest) recentOrders = latest.map(o => ({
        id: o.id,
        total: o.total,
        created_at: o.created_at,
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
        <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1
            className="gradient-text"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800 }}
          >
            KINGS HUB — ADMIN
          </h1>
          <Badge variant="warning">Apenas Administradores</Badge>
        </Container>
      </header>

      <section style={{ padding: '40px 0' }}>
        <Container>
          {/* TAB SEGMENTATION */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            <Link href="/admin?tab=kings" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: !isMsuTab ? '1px solid #25d366' : '1px solid var(--border)',
                background: !isMsuTab ? 'rgba(37, 211, 102, 0.1)' : 'var(--bg-card)', 
                color: !isMsuTab ? '#25d366' : 'var(--text-muted)', 
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '1px'
              }}>
                LOJA KINGS (D2C)
              </div>
            </Link>
            <Link href="/admin?tab=msu" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: isMsuTab ? '1px solid #06b6d4' : '1px solid var(--border)',
                background: isMsuTab ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-card)', 
                color: isMsuTab ? '#06b6d4' : 'var(--text-muted)', 
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '1px'
              }}>
                MSU MARKETPLACE (C2C)
              </div>
            </Link>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '24px' }}>
            {isMsuTab ? 'Visão C2C (Meu Simulador Usado)' : 'Visão Corporativa (Kings Store)'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {isMsuTab ? 'GMV Transacionado' : 'Faturamento Próprio'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: isMsuTab ? '#06b6d4' : 'var(--success)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {isMsuTab ? 'Vendas P2P' : 'Pedidos (Hub)'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{stats.orders}</div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {isMsuTab ? 'Total de Anúncios' : 'SKUs Cadastrados'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: isMsuTab ? '#06b6d4' : 'var(--success)' }}>{stats.productsOrListings}</div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Usuários {isMsuTab && '(Escopo Isolado)'}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--msu-primary)' }}>{stats.users}</div>
            </Card>
            {isMsuTab && (
              <Card>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Anúncios Pendentes Moderação</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--warning)' }}>{stats.metric4}</div>
              </Card>
            )}
          </div>


          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginTop: '40px', marginBottom: '16px' }}>
            Últimos Pedidos
          </h2>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Cliente</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Total</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sem pedidos.</td></tr>
                ) : (
                  recentOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{o.id.split('-')[0]}</td>
                      <td style={{ padding: '1rem' }}>{o.client}</td>
                      <td style={{ padding: '1rem', color: isMsuTab ? '#06b6d4' : 'var(--success)' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(o.total)}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </Container>
      </section>
    </div>
  )
}
