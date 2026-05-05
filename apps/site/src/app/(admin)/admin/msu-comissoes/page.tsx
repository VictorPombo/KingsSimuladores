import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { DollarSign, TrendingUp, ArrowDownRight, Clock, AlertCircle, Wallet, PieChart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MsuComissoesPage() {
  const supabase = await createServerSupabaseClient()

  // Buscar a taxa configurada na barra
  const { data: brand } = await supabase.from('brands').select('settings').eq('name', 'msu').single()
  const commissionRatePercent = brand?.settings?.commission_rate !== undefined ? Number(brand.settings.commission_rate) : 15
  const commissionRate = commissionRatePercent / 100

  const { data: orders } = await supabase
    .from('marketplace_orders')
    .select(`
      id, total_price, status, created_at, seller_net, kings_fee,
      profiles!marketplace_orders_buyer_id_fkey(full_name),
      seller:profiles!marketplace_orders_seller_id_fkey(full_name),
      listing:marketplace_listings(title)
    `)
    .order('created_at', { ascending: false })

  const allOrders = (orders || []) as any[]

  // KPIs calculados
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_price || 0), 0)
  const totalCommission = allOrders.reduce((sum, o) => {
    // Usar kings_fee se existir, senão calcular usando a taxa atual
    return sum + (o.kings_fee || (o.total_price || 0) * commissionRate)
  }, 0)
  const totalTransferred = allOrders
    .filter(o => o.status === 'completed' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.seller_net || (o.total_price || 0) * (1 - commissionRate)), 0)
  const totalPending = allOrders
    .filter(o => o.status !== 'completed' && o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.seller_net || (o.total_price || 0) * (1 - commissionRate)), 0)

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} color="#06b6d4" /> Comissões e Repasses
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Reconciliação financeira do marketplace MSU</p>
        </div>

        {/* Explainer */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Wallet size={28} color="#10b981" /></div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Quando um equipamento é vendido no MSU, a Kings retém a <strong style={{ color: '#cbd5e1' }}>comissão configurada (atualmente em {commissionRatePercent}%) sobre o valor da venda</strong> (split de pagamento) e o restante é repassado ao vendedor. <br/>
              <span style={{ color: '#64748b' }}>A comissão padrão atual pode ser ajustada na aba Pagamentos & Cofre.</span>
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Receita de Vendas', value: fmt(totalRevenue), color: '#10b981', Icon: TrendingUp },
            { label: `Comissão Kings (${commissionRatePercent}%)`, value: fmt(totalCommission), color: '#f59e0b', Icon: PieChart },
            { label: 'Repasses Efetuados', value: fmt(totalTransferred), color: '#3b82f6', Icon: ArrowDownRight },
            { label: 'Repasses Pendentes', value: fmt(totalPending), color: '#ef4444', Icon: Clock },
          ].map((k, i) => (
            <div key={i} style={{ background: '#2c2e36', borderRadius: '12px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <k.Icon size={20} color={k.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div className="admin-overflow-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
              <thead>
                <tr>
                  {['Transação', 'Produto', 'Vendedor', 'Valor Venda', 'Comissão Kings', 'Repasse Seller', 'Status', 'Data'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#1f2025', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allOrders.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <AlertCircle size={36} color="#3f424d" />
                      <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Nenhuma transação registrada</p>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Quando vendas forem concluídas no MSU, as comissões e repasses aparecerão aqui.</p>
                    </div>
                  </td></tr>
                ) : allOrders.map((o: any) => {
                  const commission = o.kings_fee || (o.total_price || 0) * commissionRate
                  const sellerNet = o.seller_net || (o.total_price || 0) * (1 - commissionRate)
                  const buyerName = Array.isArray(o.profiles) ? o.profiles[0]?.full_name : o.profiles?.full_name
                  const isCompleted = o.status === 'completed' || o.status === 'delivered'
                  const isCancelled = o.status === 'cancelled'

                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #3f424d' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        #{o.id.split('-')[0].toUpperCase()}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.listing?.title || 'Produto removido'}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                        {o.seller?.full_name || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                        {fmt(o.total_price || 0)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                          {fmt(commission)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                          {fmt(sellerNet)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                          background: isCompleted ? '#10b98115' : isCancelled ? '#ef444415' : '#f59e0b15',
                          color: isCompleted ? '#10b981' : isCancelled ? '#ef4444' : '#f59e0b',
                          border: `1px solid ${isCompleted ? '#10b98130' : isCancelled ? '#ef444430' : '#f59e0b30'}`
                        }}>
                          {isCompleted ? 'REPASSADO' : isCancelled ? 'CANCELADO' : 'RETIDO'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {new Date(o.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
