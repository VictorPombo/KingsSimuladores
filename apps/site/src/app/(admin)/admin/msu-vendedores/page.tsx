import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { Users, ShieldCheck, ShoppingBag, TrendingUp, AlertCircle, UserCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MsuVendedoresPage() {
  const supabase = await createServerSupabaseClient()

  // Buscar todos os listings e agrupar por seller_id
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('seller_id, status')

  // Buscar vendas realizadas
  const { data: sales } = await supabase
    .from('marketplace_orders')
    .select('seller_id')

  // Extrair seller_ids únicos
  const sellerMap = new Map<string, { listings: number; activeListings: number; sales: number }>()
  
  ;(listings || []).forEach((l: any) => {
    if (!l.seller_id) return
    const existing = sellerMap.get(l.seller_id) || { listings: 0, activeListings: 0, sales: 0 }
    existing.listings++
    if (l.status === 'active') existing.activeListings++
    sellerMap.set(l.seller_id, existing)
  })

  ;(sales || []).forEach((s: any) => {
    if (!s.seller_id) return
    const existing = sellerMap.get(s.seller_id) || { listings: 0, activeListings: 0, sales: 0 }
    existing.sales++
    sellerMap.set(s.seller_id, existing)
  })

  const sellerIds = Array.from(sellerMap.keys())

  // Buscar perfis dos sellers
  let sellersWithProfiles: any[] = []
  if (sellerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', sellerIds)

    sellersWithProfiles = (profiles || []).map((p: any) => ({
      ...p,
      stats: sellerMap.get(p.id) || { listings: 0, activeListings: 0, sales: 0 }
    }))
  }

  // KPIs
  const totalSellers = sellersWithProfiles.length
  const activeSellers = sellersWithProfiles.filter(s => s.stats.activeListings > 0).length
  const totalSales = sellersWithProfiles.reduce((sum, s) => sum + s.stats.sales, 0)

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="#06b6d4" /> Vendedores MSU
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Perfis e estatísticas dos pilotos que vendem no marketplace</p>
        </div>

        {/* Explainer */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#06b6d420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><UserCheck size={28} color="#06b6d4" /></div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Todo usuário que submete um anúncio no MSU se torna automaticamente um <strong style={{ color: '#cbd5e1' }}>vendedor</strong>. Aqui você acompanha quem são, quantos anúncios publicaram e suas estatísticas de vendas. <br/>
              <span style={{ color: '#64748b' }}>Os dados abaixo são extraídos em tempo real do banco de dados.</span>
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Vendedores', value: String(totalSellers), color: '#06b6d4', Icon: Users },
            { label: 'Com Anúncios Ativos', value: String(activeSellers), color: '#10b981', Icon: TrendingUp },
            { label: 'Vendas Realizadas', value: String(totalSales), color: '#f59e0b', Icon: ShoppingBag },
          ].map((k, i) => (
            <div key={i} style={{ background: '#2c2e36', borderRadius: '12px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.Icon size={20} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div className="admin-overflow-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
              <thead>
                <tr>
                  {['Vendedor', 'E-mail', 'Anúncios', 'Ativos', 'Vendas', 'Status'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#1f2025', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sellersWithProfiles.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <AlertCircle size={36} color="#3f424d" />
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Nenhum vendedor registrado</p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Quando pilotos começarem a anunciar, seus perfis aparecerão aqui automaticamente.</p>
                    </div>
                  </td></tr>
                ) : sellersWithProfiles.map((seller: any) => (
                  <tr key={seller.id} style={{ borderBottom: '1px solid #3f424d' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#06b6d415', border: '1px solid #06b6d430', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700 }}>
                          {(seller.full_name || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{seller.full_name || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>{seller.email || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#e2e8f0', fontWeight: 700, fontFamily: 'monospace' }}>{seller.stats.listings}</td>
                    <td style={{ padding: '14px 20px', color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>{seller.stats.activeListings}</td>
                    <td style={{ padding: '14px 20px', color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>{seller.stats.sales}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                        background: seller.stats.activeListings > 0 ? '#10b98115' : '#64748b15',
                        color: seller.stats.activeListings > 0 ? '#10b981' : '#64748b',
                        border: `1px solid ${seller.stats.activeListings > 0 ? '#10b98130' : '#64748b30'}`
                      }}>
                        {seller.stats.activeListings > 0 ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
