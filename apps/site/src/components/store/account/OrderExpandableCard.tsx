'use client'

import React, { useState } from 'react'
import { createClient } from '@kings/db/client'
import { formatPrice } from '@kings/utils'
import { ChevronDown, ChevronUp, Clock, Package, CheckCircle, Truck, ShoppingBag, Info } from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'

export function OrderExpandableCard({ order }: { order: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [syncingInvoiceId, setSyncingInvoiceId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState<string | null>(null)
  
  const handleSyncInvoice = async (orderId: string, invoiceId: string) => {
    setSyncingInvoiceId(invoiceId)
    try {
      const res = await fetch('/api/invoices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      const data = await res.json()
      if (data.pdf_url) {
        // Atualiza a URL na lista de invoices local
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, pdf_url: data.pdf_url } : inv))
        // Abre o link
        window.open(data.pdf_url, '_blank')
      } else {
        alert(data.message || data.error || 'Erro ao sincronizar NF.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao comunicar com a API de NFe.')
    } finally {
      setSyncingInvoiceId(null)
    }
  }
  const orderNumber = order.id.split('-')[0].toUpperCase()

  const handleExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false)
      return
    }

    setIsExpanded(true)
    
    // Se já carregou os itens antes, não faz fetch de novo
    if (items.length > 0) return
    
    setIsLoading(true)
    const supabase = createClient()
    
    // Busca os order_items do pedido
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('*, product:product_id(*)')
      .eq('order_id', order.id)

    if (!error && orderItems) {
      const itemIds = orderItems.map(i => i.id)
      const { data: payoutsData } = await supabase.from('payouts').select('*').in('order_item_id', itemIds)
      
      const itemsWithPayouts = orderItems.map(item => ({
         ...item,
         payout: payoutsData?.find(p => p.order_item_id === item.id)
      }))
      setItems(itemsWithPayouts)
    }

    const { data: invs } = await supabase.from('invoices').select('*').eq('order_id', order.id)
    if (invs) setInvoices(invs)
    
    setIsLoading(false)
  }

  const handlePayNow = async () => {
    setIsPaying(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/pay`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.ok && data.init_point) {
        window.location.href = data.init_point
      } else {
        alert(data.error || 'Erro ao gerar link de pagamento.')
        setIsPaying(false)
      }
    } catch (err) {
      alert('Erro de comunicação.')
      setIsPaying(false)
    }
  }

  const handleConfirmReceipt = async (payoutId: string) => {
    if (!confirm('Confirmar o recebimento do produto? O dinheiro será liberado para o vendedor e você não poderá abrir reclamação por defeito.')) return
    
    setIsConfirming(payoutId)
    try {
      const res = await fetch('/api/orders/release-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao liberar pagamento.')
      }
      
      setItems(prev => prev.map(item => item.payout?.id === payoutId ? { ...item, payout: { ...item.payout, status: 'available' } } : item))
      alert('Obrigado! O pagamento foi liberado para o vendedor.')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsConfirming(null)
    }
  }

  // Lógica da Timeline de Rastreio (Simulada pelo status do banco)
  const getTimelineStep = () => {
    switch(order.status) {
      case 'pending': return 1;
      case 'paid': return 2;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  }

  const currentStep = getTimelineStep()

  return (
    <div 
      className="order-card card-panel" 
      style={{ 
        padding: '0', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        border: isExpanded ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(255,255,255,0.08)',
        background: isExpanded ? 'rgba(0, 229, 255, 0.02)' : 'rgba(10, 14, 26, 0.8)'
      }}
    >
      {/* HEADER: Resumo do Pedido (Clicável) */}
      <div 
        onClick={handleExpand}
        style={{ 
          padding: '1.5rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '1.5rem', 
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            Pedido
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>#{orderNumber}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Clock size={14} /> Data da Compra
          </div>
          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>
            {new Date(order.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            Total Pago
          </div>
          <div style={{ color: '#00e5ff', fontWeight: 800, fontSize: '1.1rem' }}>{formatPrice(order.total)}</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Status</div>
            <OrderStatusBadge orderId={order.id} initialStatus={order.status} />
          </div>
          <div style={{ color: '#a1a1aa' }}>
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </div>

      {/* ÁREA EXPANDIDA: Itens e Rastreio */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          
          {/* Seção 1: Linha do Tempo (Rastreio) */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#e2e8f0', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#00e5ff" /> Status da Entrega
            </h4>
            
            {order.tracking_code && (
              <div style={{ alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.15)', marginBottom: '1.5rem', display: 'inline-flex' }}>
                <Package size={20} color="#10b981" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Código de Rastreio SEDEX</div>
                  <div style={{ fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>{order.tracking_code}</div>
                </div>
              </div>
            )}

            {/* Timeline UI */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '1rem', overflowX: 'auto', paddingBottom: '10px' }}>
              <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '15px', left: '10%', width: `${(currentStep - 1) * 33.3}%`, height: '2px', background: '#00e5ff', zIndex: 0, transition: 'width 0.5s ease' }} />

              {['Aguardando Pagamento', 'Preparando Envio', 'Em Trânsito', 'Entregue'].map((stepName, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, minWidth: '80px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      background: isActive ? '#00e5ff' : '#1e293b', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 15px rgba(0,229,255,0.5)' : 'none',
                      border: '2px solid', borderColor: isActive ? '#00e5ff' : 'rgba(255,255,255,0.1)',
                      color: isActive ? '#000' : '#64748b', transition: 'all 0.3s'
                    }}>
                      {isActive ? <CheckCircle size={16} /> : stepNum}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isActive ? '#f8fafc' : '#64748b', marginTop: '8px', fontWeight: isActive ? 600 : 400, textAlign: 'center' }}>
                      {stepName}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Seção 2: Itens do Pedido */}
          <div>
            <h4 style={{ color: '#e2e8f0', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} color="#10b981" /> Itens Comprados
            </h4>
            
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ width: '30px', height: '30px', border: '3px solid rgba(0,229,255,0.2)', borderTop: '3px solid #00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                Carregando itens...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {items.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', color: '#94a3b8', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Info size={16} /> Nenhum item encontrado para este pedido.
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', background: '#1e293b', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.product?.image_url || item.product?.images?.[0] ? (
                          <img src={item.product.image_url || item.product.images[0]} alt={item.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package size={24} color="#64748b" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.product?.title || 'Produto Indisponível'}</div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                          Quantidade: {item.quantity} x {formatPrice(item.unit_price)}
                        </div>
                        {item.payout?.tracking_code && item.payout?.status === 'held' && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Truck size={14} /> Enviado pelo Vendedor (Cód: <strong>{item.payout.tracking_code}</strong>)
                            </div>
                            <button 
                              onClick={() => handleConfirmReceipt(item.payout.id)}
                              disabled={isConfirming === item.payout.id}
                              style={{ background: '#E8002D', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: isConfirming === item.payout.id ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                            >
                              {isConfirming === item.payout.id ? 'Liberando...' : 'Já Recebi e Testei'}
                            </button>
                          </div>
                        )}
                        {(item.payout?.status === 'available' || item.payout?.status === 'paid') && (
                           <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={14} /> Recebimento Confirmado
                           </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
                        {formatPrice(item.total_price)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Subtotais */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}>
               <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Subtotal: <span style={{ color: '#fff', display: 'inline-block', width: '100px', textAlign: 'right' }}>{formatPrice(order.subtotal || order.total)}</span></div>
               <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Frete: <span style={{ color: '#fff', display: 'inline-block', width: '100px', textAlign: 'right' }}>{formatPrice(order.shipping_cost || 0)}</span></div>
               <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00e5ff', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                 Total Pago: <span style={{ display: 'inline-block', width: '100px', textAlign: 'right' }}>{formatPrice(order.total)}</span>
               </div>
            </div>
            
            {/* Ações Inferiores */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {invoices.length > 0 ? (
                invoices.map((inv, idx) => {
                  const isSyncing = syncingInvoiceId === inv.id
                  return inv.pdf_url ? (
                    <a 
                      key={idx}
                      href={inv.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn" 
                      style={{ textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '0.5rem', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      Nota Fiscal ({inv.store_origin === 'seven' ? 'Seven' : (inv.store_origin === 'msu' ? 'MSU' : 'Kings')})
                    </a>
                  ) : (
                    <button 
                      key={idx}
                      onClick={() => handleSyncInvoice(order.id, inv.id)}
                      disabled={isSyncing}
                      className="action-btn" 
                      style={{ background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '10px 16px', borderRadius: '0.5rem', color: '#3b82f6', cursor: isSyncing ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                      title="Clique para verificar se o ERP já emitiu o PDF da sua Nota Fiscal."
                    >
                      {isSyncing ? 'Buscando na Sefaz/ERP...' : `Puxar Nota Fiscal (${inv.store_origin === 'seven' ? 'Seven' : (inv.store_origin === 'msu' ? 'MSU' : 'Kings')})`}
                    </button>
                  )
                })
              ) : (
                order.status === 'paid' && (
                  <button className="action-btn" disabled style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '0.5rem', color: '#64748b', cursor: 'not-allowed', fontSize: '0.85rem', fontWeight: 600 }}>
                    Nota Fiscal (Processando...)
                  </button>
                )
              )}
              <a 
                href={`https://wa.me/5511959018725?text=Olá, preciso de ajuda com o meu pedido %23${orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn" 
                style={{ textDecoration: 'none', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '10px 16px', borderRadius: '0.5rem', color: '#00e5ff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Falar com Suporte
              </a>

              {order.status === 'pending' && (
                <button 
                  onClick={handlePayNow}
                  disabled={isPaying}
                  className="action-btn kings-btn-primary" 
                  style={{ 
                    background: '#00e5ff', color: '#0a0e1a', border: 'none', padding: '10px 24px', 
                    borderRadius: '0.5rem', cursor: isPaying ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 700,
                    opacity: isPaying ? 0.7 : 1
                  }}
                >
                  {isPaying ? 'Gerando Link...' : 'Pagar Agora'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
