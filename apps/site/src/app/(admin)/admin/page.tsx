import { Card, Container, Badge } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import Link from 'next/link'
import { RevenueChart } from './components/AdminCharts'
import { TrendingUp, TrendingDown, Clock, MoveRight, ShoppingBag, ShieldCheck, Mail, Zap } from 'lucide-react'


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
        <Container style={{ maxWidth: '1400px' }}>
          {/* TAB SEGMENTATION */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            <Link href="/admin?tab=kings" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: !isMsuTab ? '1px solid #10b981' : '1px solid var(--border)',
                background: !isMsuTab ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)', 
                color: !isMsuTab ? '#10b981' : 'var(--text-muted)', 
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '1px',
                transition: 'all 0.2s',
                boxShadow: !isMsuTab ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none'
              }}>
                👑 LOJA KINGS (D2C)
              </div>
            </Link>
            <Link href="/admin?tab=msu" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: isMsuTab ? '1px solid #06b6d4' : '1px solid var(--border)',
                background: isMsuTab ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)', 
                color: isMsuTab ? '#06b6d4' : 'var(--text-muted)', 
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '1px',
                transition: 'all 0.2s',
                boxShadow: isMsuTab ? '0 0 15px rgba(6, 182, 212, 0.1)' : 'none'
              }}>
                ♻️ MSU MARKETPLACE (C2C)
              </div>
            </Link>
          </div>

          <div className="admin-header-flex" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#f8fafc', margin: 0 }}>
              {isMsuTab ? 'Visão Geral C2C (MSU)' : 'Visão Corporativa (Kings Store)'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Atualizado em tempo real</div>
          </div>

          {/* KPIs ENTERPRISE */}
          <div className="admin-kpi-grid" style={{ marginBottom: '32px' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: `1px solid ${isMsuTab ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                {isMsuTab ? 'GMV Transacionado' : 'Faturamento Próprio'}
                <TrendingUp size={16} color={isMsuTab ? '#06b6d4' : '#10b981'} />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <TrendingUp size={12} /> +14.2% desde o mês passado
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                {isMsuTab ? 'Vendas P2P' : 'Pedidos (Hub)'}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>{stats.orders}</div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <TrendingUp size={12} /> +8.5% desde o mês passado
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                {isMsuTab ? 'Total de Anúncios' : 'SKUs Cadastrados'}
                <ShoppingBag size={16} color="#64748b" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>{stats.productsOrListings}</div>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                Inventário Ativo Automático
              </div>
            </div>

            {isMsuTab ? (
              <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.05)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  Aguardando Moderação
                  <ShieldCheck size={16} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f59e0b' }}>
                  {stats.metric4} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>itens</span>
                </div>
                <Link href="/admin/moderacao" style={{ textDecoration: 'none' }}>
                  <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    Revisar Agora <MoveRight size={12} />
                  </div>
                </Link>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>Clientes na Base</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#f8fafc' }}>{stats.users}</div>
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <TrendingUp size={12} /> SSO Unificado
                </div>
              </div>
            )}
          </div>

          {/* GRÁFICOS E AÇÕES RÁPIDAS (SPLIT VIEW) */}
          <div className="admin-grid-2-1" style={{ marginBottom: '40px' }}>
            <div>
              <RevenueChart isMsu={isMsuTab} />
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: '#f8fafc', marginBottom: '16px' }}>🚀 Ações Rápidas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href={isMsuTab ? '/admin/moderacao' : '/admin/criar-produto'} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }} className="hover:border-[#00e5ff] hover:-translate-y-1">
                    <div style={{ background: 'rgba(0,229,255,0.1)', padding: '10px', borderRadius: '8px' }}><Zap size={20} color="#00e5ff" /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{isMsuTab ? 'Moderar Anúncios' : 'Cadastrar Novo Produto'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isMsuTab ? 'Aprove listagens da comunidade' : 'Envie direto para ML e Shopee'}</div>
                    </div>
                  </div>
                </Link>

                <Link href={isMsuTab ? '/admin/msu-comissoes' : '/admin/pedidos'} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }} className="hover:border-[#8b5cf6] hover:-translate-y-1">
                    <div style={{ background: 'rgba(139,92,246,0.1)', padding: '10px', borderRadius: '8px' }}><ShoppingBag size={20} color="#8b5cf6" /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{isMsuTab ? 'Repasses e Comissões' : 'Painel de Fulfillment'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{isMsuTab ? 'Acompanhe as taxas Cobradas' : 'Despache pedidos urgentes'}</div>
                    </div>
                  </div>
                </Link>

                <Link href="/admin/chave-api" style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }} className="hover:border-[#f59e0b] hover:-translate-y-1">
                    <div style={{ background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px' }}><ShieldCheck size={20} color="#f59e0b" /></div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Configurações de Integração</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mercado Pago, Melhor Envio, Bling</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>


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
                          {o.client}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                          background: o.status === 'paid' || o.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: o.status === 'paid' || o.status === 'completed' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${o.status === 'paid' || o.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {o.status === 'paid' ? 'PAGO' : o.status === 'pending' ? 'AGUARDANDO' : o.status.toUpperCase()}
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
