import { Card, Container, Badge } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'

export default async function AdminDashboard() {
  let stats = { orders: 0, products: 0, users: 0, pendingListings: 0, revenue: 0 }
  let recentOrders: any[] = []

  try {
    const supabase = await createServerSupabaseClient()
    
    // Fetch stats
    const [ordersRes, productsRes, usersRes, listingsRes, revenueRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('orders').select('total').eq('status', 'paid')
    ])
    
    const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

    stats = {
      orders: ordersRes.count || 0,
      products: productsRes.count || 0,
      users: usersRes.count || 0,
      pendingListings: listingsRes.count || 0,
      revenue: totalRevenue,
    }

    // Fetch recent orders
    const { data: latest } = await supabase
      .from('orders')
      .select('id, brand_origin, total, status, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)
      
    if (latest) recentOrders = latest

  } catch {
    // Tables not yet created
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '24px' }}>
            Dashboard
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Faturamento (Pago)</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--success)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Pedidos</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{stats.orders}</div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Produtos</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--success)' }}>{stats.products}</div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Usuários</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--msu-primary)' }}>{stats.users}</div>
            </Card>
            <Card>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Anúncios Pendentes</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--warning)' }}>{stats.pendingListings}</div>
            </Card>
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
                      <td style={{ padding: '1rem' }}>{o.profiles?.full_name || 'Anônimo'}</td>
                      <td style={{ padding: '1rem', color: 'var(--success)' }}>
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
