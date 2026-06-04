import React from 'react'
import { createAdminClient } from '@kings/db'
import { ShieldCheck, Package, CircleDollarSign, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react'

export const dynamic = 'force-dynamic'

type PayoutStatus = 'held' | 'available' | 'paid' | 'refunded'

function EscrowBadge({ status }: { status: PayoutStatus | null }) {
  const config: Record<PayoutStatus, { label: string; color: string; icon: React.ReactNode }> = {
    held:      { label: 'Retido (Escrow)',         color: '#f59e0b', icon: <ShieldCheck size={14} color="#f59e0b" /> },
    available: { label: 'Disponível para Repasse', color: '#10b981', icon: <CheckCircle  size={14} color="#10b981" /> },
    paid:      { label: 'Repasse Efetuado',         color: '#8b5cf6', icon: <CircleDollarSign size={14} color="#8b5cf6" /> },
    refunded:  { label: 'Reembolsado',              color: '#ef4444', icon: <RefreshCcw   size={14} color="#ef4444" /> },
  }

  const { label, color, icon } = status ? config[status] ?? config.held : config.held

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: '#1e293b', border: '1px solid #334155', padding: '6px 12px', borderRadius: '20px',
      fontSize: '0.75rem', fontWeight: 600, width: 'fit-content',
    }}>
      {icon}
      <span style={{ color }}>{label}</span>
    </div>
  )
}

export default async function MsuPedidosPage() {
  const supabase = createAdminClient()

  const { data: rawOrders } = await supabase
    .from('marketplace_orders')
    .select(`
      *,
      profiles!marketplace_orders_buyer_id_fkey(full_name, email),
      seller:profiles!marketplace_orders_seller_id_fkey(full_name),
      listing:marketplace_listings(title)
    `)
    .order('created_at', { ascending: false })

  const orders = rawOrders || []

  // Fetch payouts for all marketplace orders via order_items → payouts
  const orderIds = orders.map((o: any) => o.order_id).filter(Boolean) as string[]
  let payoutsByOrderItemId: Record<string, PayoutStatus> = {}

  if (orderIds.length > 0) {
    const { data: payoutsData } = await supabase
      .from('payouts')
      .select('order_item_id, status, order_item:order_items!inner(order_id)')
      .in('order_item:order_items.order_id', orderIds)

    if (payoutsData) {
      for (const p of payoutsData as any[]) {
        payoutsByOrderItemId[p.order_item_id] = p.status as PayoutStatus
      }
    }
  }

  // Also try to fetch payouts linked via marketplace_orders.listing_id when order_id is missing
  // by using mp_preference_id resolution — fall back to marketplace_orders.id lookup
  const mpOrderIds = orders.map((o: any) => o.id).filter(Boolean) as string[]
  if (mpOrderIds.length > 0) {
    const { data: payoutsDirect } = await supabase
      .from('payouts')
      .select('order_item_id, status, order_item:order_items!inner(product_id, order_id)')
      .not('order_item_id', 'is', null)

    if (payoutsDirect) {
      for (const p of payoutsDirect as any[]) {
        if (!payoutsByOrderItemId[p.order_item_id]) {
          payoutsByOrderItemId[p.order_item_id] = p.status as PayoutStatus
        }
      }
    }
  }

  // Build a lookup: marketplace_orders.listing_id → payout status
  // (one payout per listing sale — join via order_items.product_id = listing_id)
  const { data: payoutsWithListing } = await supabase
    .from('payouts')
    .select('status, order_item:order_items!inner(product_id)')

  const payoutByListingId: Record<string, PayoutStatus> = {}
  if (payoutsWithListing) {
    for (const p of payoutsWithListing as any[]) {
      const listingId = p.order_item?.product_id
      if (listingId) payoutByListingId[listingId] = p.status as PayoutStatus
    }
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={24} color="#06b6d4" /> Transações P2P (Escrow)
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Gerencie vendas e liberação de retenções do Mercado Pago</p>
          </div>
        </div>

        <div className="admin-overflow-table" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                <th style={{ padding: '16px', fontWeight: 600 }}>ID Venda</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Produto</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Partes</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Split Financeiro</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Logística</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Status do Escrow</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Nenhuma transação P2P encontrada.</td></tr>
              ) : (
                orders.map((o: any) => {
                  const escrowStatus: PayoutStatus | null = payoutByListingId[o.listing_id] ?? null
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                        #{o.id.split('-')[0].toUpperCase()}
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                          {new Date(o.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      <td style={{ padding: '16px', maxWidth: '200px' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {o.listing?.title || 'Produto Removido'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                          Total: R$ {o.total_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          <span style={{ color: '#06b6d4' }}>De:</span> {o.seller?.full_name || 'Vendedor'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                          <span style={{ color: '#10b981' }}>Para:</span> {Array.isArray(o.profiles) ? o.profiles[0]?.full_name : o.profiles?.full_name || 'Comprador'}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                          <div style={{ background: '#10b98115', border: '1px solid #10b98130', color: '#10b981', padding: '4px 8px', borderRadius: '4px' }}>
                            Seller: R$ {o.seller_net?.toLocaleString('pt-BR')}
                          </div>
                          <div style={{ background: '#8b5cf615', border: '1px solid #8b5cf630', color: '#8b5cf6', padding: '4px 8px', borderRadius: '4px' }}>
                            Kings: R$ {o.kings_fee?.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        {o.tracking_code ? (
                          <div style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                            🚚 {o.tracking_code}
                          </div>
                        ) : (
                          <div style={{ color: '#f59e0b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={12} /> Aguardando envio
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '16px' }}>
                        <EscrowBadge status={escrowStatus} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
