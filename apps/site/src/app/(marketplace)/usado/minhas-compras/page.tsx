'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Container } from '@kings/ui'
import { Package, Truck, CheckCircle, Clock, AlertCircle, ShieldCheck, Star } from 'lucide-react'

type Order = {
  id: string
  listing_id: string
  total_price: number
  status: string | null
  tracking_code: string | null
  created_at: string
  listing: { title: string; images: string[] } | null
  seller: { full_name: string } | null
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Aguardando Pagamento', color: '#f59e0b', icon: <Clock size={16} color="#f59e0b" /> },
  paid:      { label: 'Pago — Aguardando Envio', color: '#3b82f6', icon: <Package size={16} color="#3b82f6" /> },
  shipped:   { label: 'Enviado', color: '#06b6d4', icon: <Truck size={16} color="#06b6d4" /> },
  delivered: { label: 'Entregue', color: '#10b981', icon: <CheckCircle size={16} color="#10b981" /> },
  cancelled: { label: 'Cancelado', color: '#ef4444', icon: <AlertCircle size={16} color="#ef4444" /> },
}

export default function MinhasComprasPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/usado/login')
        return
      }

      // Buscar profile.id do comprador
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_id', session.user.id)
        .single()

      if (!profile) {
        router.push('/usado/login')
        return
      }

      const { data } = await supabase
        .from('marketplace_orders')
        .select(`
          id, listing_id, total_price, status, tracking_code, created_at,
          listing:marketplace_listings(title, images),
          seller:profiles!marketplace_orders_seller_id_fkey(full_name)
        `)
        .eq('buyer_id', profile.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data as any)
      setLoading(false)
    }
    fetchOrders()
  }, [router])

  const handleConfirmDelivery = async (orderId: string) => {
    if (!confirm('Você confirma que recebeu o produto em boas condições? O pagamento será liberado ao vendedor.')) return
    setConfirmingId(orderId)

    try {
      // Buscar payout associado a este marketplace_order via listing_id
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Release escrow via API
      const res = await fetch('/api/orders/release-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o))
        alert('Recebimento confirmado! O vendedor será notificado.')
      } else {
        const err = await res.json()
        alert('Erro: ' + (err.error || 'Falha ao confirmar'))
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setConfirmingId(null)
    }
  }

  if (loading) {
    return (
      <Container style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Carregando suas compras...</div>
      </Container>
    )
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh' }}>
      <Container style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
              <Package size={28} color="var(--accent)" /> Minhas Compras
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Acompanhe o status dos equipamentos que você adquiriu no MSU.
            </p>
          </div>

          {/* Empty State */}
          {orders.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '1rem', padding: '4rem 2rem', textAlign: 'center'
            }}>
              <Package size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Nenhuma compra realizada ainda
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Quando você comprar um equipamento usado, ele aparecerá aqui.
              </p>
              <a href="/usado/produtos" style={{
                display: 'inline-block', background: 'var(--accent)', color: '#000',
                padding: '12px 28px', borderRadius: '8px', fontWeight: 700,
                textDecoration: 'none', fontSize: '0.95rem'
              }}>
                Explorar Equipamentos
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => {
                const status = STATUS_MAP[order.status || 'pending'] || STATUS_MAP.pending
                const listing = order.listing as any
                const seller = order.seller as any
                const isShipped = order.status === 'shipped'
                const isDelivered = order.status === 'delivered'

                return (
                  <div key={order.id} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s'
                  }}>
                    {/* Order Header */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 20px', background: 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {status.icon}
                        <span style={{ color: status.color, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {status.label}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Pedido #{order.id.split('-')[0].toUpperCase()} · {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Order Body */}
                    <div style={{ display: 'flex', padding: '20px', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Image */}
                      <div style={{
                        width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden',
                        background: 'rgba(255,255,255,0.03)', flexShrink: 0
                      }}>
                        {listing?.images?.[0] ? (
                          <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={24} color="var(--border)" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                          {listing?.title || 'Equipamento'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                          Vendedor: {seller?.full_name || '—'}
                        </p>
                        {order.tracking_code && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                            padding: '4px 10px', borderRadius: '6px', marginTop: '8px',
                            fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600, fontFamily: 'monospace'
                          }}>
                            <Truck size={14} /> {order.tracking_code}
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 800 }}>
                          R$ {order.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isShipped && !isDelivered && (
                      <div style={{
                        padding: '14px 20px', borderTop: '1px solid var(--border)',
                        background: 'rgba(16, 185, 129, 0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={18} color="#10b981" />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Recebeu o produto? Confirme para liberar o pagamento ao vendedor.
                          </span>
                        </div>
                        <button
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirmingId === order.id}
                          style={{
                            background: '#10b981', color: '#fff', border: 'none',
                            padding: '10px 24px', borderRadius: '8px', fontWeight: 700,
                            fontSize: '0.9rem', cursor: 'pointer', opacity: confirmingId === order.id ? 0.5 : 1,
                            transition: 'opacity 0.2s'
                          }}
                        >
                          {confirmingId === order.id ? 'Confirmando...' : '✅ Confirmar Recebimento'}
                        </button>
                      </div>
                    )}

                    {/* Delivered State */}
                    {isDelivered && (
                      <div style={{
                        padding: '14px 20px', borderTop: '1px solid var(--border)',
                        background: 'rgba(16, 185, 129, 0.03)',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <CheckCircle size={18} color="#10b981" />
                        <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                          Entrega confirmada — Obrigado pela confiança!
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}
