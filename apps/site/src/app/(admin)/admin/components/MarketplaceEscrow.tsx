"use client"
import React, { useState, useEffect } from 'react'
import { Shield, Truck, Package, MapPin, Star, Check, CheckCircle, AlertTriangle, ChevronRight, DollarSign, TrendingUp, BarChart3, Eye, Download, Ban, Lock, Wallet, CreditCard, Clock } from 'lucide-react'
import { createClient } from '@kings/db/client'

const S = {
  card: { background:'#2c2e36', borderRadius:'10px', border:'1px solid #3f424d', overflow:'hidden' } as React.CSSProperties,
  input: { width:'100%', background:'#1f2025', border:'1px solid #3f424d', borderRadius:'6px', padding:'10px 14px', color:'#fff', fontSize:'0.9rem', outline:'none' } as React.CSSProperties,
  btn: { padding:'10px 20px', borderRadius:'8px', border:'none', fontSize:'0.9rem', fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', outline:'none' } as React.CSSProperties,
  label: { color:'#94a3b8', fontSize:'0.75rem', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:'4px' },
}

type View = 'orders' | 'detail' | 'seller' | 'admin'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  awaiting_payment: { label: 'Aguardando Pagamento', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  paid: { label: 'Pagamento Aprovado', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  awaiting_shipment: { label: 'Aguardando Envio', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  shipped: { label: 'Enviado', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  delivered: { label: 'Entregue', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  completed: { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  dispute: { label: 'Em Disputa', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  refunded: { label: 'Reembolsado', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  cancelled: { label: 'Cancelado', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
}

export function MarketplaceEscrow() {
  const [view, setView] = useState<View>('admin')
  const [orders, setOrders] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [commissionRate, setCommissionRate] = useState(10)
  
  const supabase = createClient()
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('marketplace_orders')
      .select(`
        *,
        buyer:buyer_id(id, full_name),
        seller:seller_id(id, full_name),
        listing:listing_id(id, title, price, images, condition)
      `)
      .order('created_at', { ascending: false })
      
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const selected = orders.find(o => o.id === selectedId)

  const openDetail = (id: string) => { setSelectedId(id); setView('detail') }

  const updateStatus = async (id: string, newStatus: string, updates: any = {}) => {
    const { error } = await supabase
      .from('marketplace_orders')
      .update({ status: newStatus, ...updates })
      .eq('id', id)
      
    if (!error) {
      fetchOrders()
    } else {
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const statusBadge = (s: string) => {
    const m = STATUS_MAP[s] || { label: s, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
    return <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'0.7rem', fontWeight:700, color:m.color, background:m.bg, border:`1px solid ${m.color}30` }}>{m.label}</span>
  }

  const renderOrders = (filterSeller?: boolean) => {
    let filteredOrders = orders
    if (filterSeller) filteredOrders = orders.filter(o => o.seller_id === currentUserId)
    else if (view === 'orders') filteredOrders = orders.filter(o => o.buyer_id === currentUserId)

    return (
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ color:'#fff', fontSize:'1.2rem', fontWeight:700, margin:0 }}>
            {filterSeller ? '🏪 Minhas Vendas' : view === 'admin' ? '🛡️ Todos os Pedidos' : '📦 Meus Pedidos'}
          </h2>
        </div>
        <div style={{ ...S.card }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
            <thead><tr style={{ background:'#1f2025', color:'#94a3b8' }}>
              <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Pedido</th>
              <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Produto</th>
              {!filterSeller && <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Vendedor</th>}
              {filterSeller && <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Comprador</th>}
              <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Status</th>
              <th style={{ padding:'12px 16px', textAlign:'right', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>Valor</th>
              <th style={{ padding:'12px 16px', textAlign:'center', fontWeight:600, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.5px' }}></th>
            </tr></thead>
            <tbody>
              {filteredOrders.length === 0 && (
                <tr><td colSpan={6} style={{ padding:'40px', textAlign:'center', color:'#64748b' }}>Nenhum pedido encontrado.</td></tr>
              )}
              {filteredOrders.map(o => (
                <tr key={o.id} style={{ borderBottom:'1px solid #3f424d' }}>
                  <td style={{ padding:'14px 16px', color:'#cbd5e1', fontFamily:'monospace', fontSize:'0.8rem' }}>{o.id.split('-')[0]}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#1f2025', overflow: 'hidden' }}>
                        {o.listing?.images?.[0] && <img src={o.listing.images[0]} style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
                      </div>
                      <div>
                        <div style={{ color:'#fff', fontWeight:600, fontSize:'0.85rem' }}>{o.listing?.title}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px', color:'#cbd5e1' }}>{filterSeller ? o.buyer?.full_name : o.seller?.full_name}</td>
                  <td style={{ padding:'14px 16px' }}>{statusBadge(o.status || 'awaiting_payment')}</td>
                  <td style={{ padding:'14px 16px', textAlign:'right', color:'#10b981', fontWeight:700 }}>
                    {formatBRL(filterSeller ? o.seller_net : o.total_price)}
                  </td>
                  <td style={{ padding:'14px 16px', textAlign:'center' }}>
                    <button onClick={() => openDetail(o.id)} style={{ ...S.btn, padding:'6px 12px', background:'#3f424d', fontSize:'0.8rem' }}>
                      <Eye size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderDetail = () => {
    if (!selected) return null
    
    // Status timestamps for timeline
    const isPaid = ['paid', 'awaiting_shipment', 'shipped', 'delivered', 'completed', 'dispute'].includes(selected.status)
    const isShipped = ['shipped', 'delivered', 'completed', 'dispute'].includes(selected.status)
    const isDelivered = ['delivered', 'completed', 'dispute'].includes(selected.status)
    const isCompleted = selected.status === 'completed'
    
    const steps = [
      { label: 'Pedido Realizado', date: new Date(selected.created_at).toLocaleDateString(), done: true, current: false },
      { label: 'Pagamento Confirmado', done: isPaid, current: selected.status === 'awaiting_payment' },
      { label: 'Aguardando Envio', done: isShipped, current: selected.status === 'paid' || selected.status === 'awaiting_shipment' },
      { label: 'Em Trânsito', done: isDelivered, current: selected.status === 'shipped' },
      { label: 'Entregue', done: isDelivered, current: selected.status === 'delivered' },
      { label: 'Concluído', done: isCompleted, current: false },
    ]

    return (
      <div>
        <button onClick={() => { setView('admin'); setSelectedId('') }} style={{ ...S.btn, background:'transparent', color:'#94a3b8', padding:'0 0 16px 0', fontSize:'0.85rem' }}>← Voltar</button>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'20px' }}>
          <div>
            <div style={{ ...S.card, padding:'24px', marginBottom:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <div>
                  <h3 style={{ color:'#fff', margin:0, fontSize:'1.1rem' }}>Pedido {selected.id.split('-')[0]}</h3>
                  <div style={{ color:'#64748b', fontSize:'0.8rem' }}>{new Date(selected.created_at).toLocaleString('pt-BR')}</div>
                </div>
                {statusBadge(selected.status || 'awaiting_payment')}
              </div>
              
              <div style={{ display:'flex', gap:'16px', alignItems:'center', padding:'16px', background:'#1f2025', borderRadius:'8px', marginBottom:'24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#000', overflow: 'hidden' }}>
                  {selected.listing?.images?.[0] && <img src={selected.listing.images[0]} style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#fff', fontWeight:700, fontSize:'1rem' }}>{selected.listing?.title}</div>
                  <div style={{ color:'#f59e0b', fontSize:'0.8rem', marginTop:'4px' }}>Vendedor: {selected.seller?.full_name}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'#10b981', fontSize:'1.3rem', fontWeight:800 }}>{formatBRL(selected.listing?.price)}</div>
                </div>
              </div>

              <h4 style={{ color:'#fff', fontSize:'0.9rem', fontWeight:700, marginBottom:'16px' }}>Acompanhamento</h4>
              {steps.map((step, i) => (
                <div key={i} style={{ display:'flex', gap:'12px' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: step.done ? '#10b981' : step.current ? '#3b82f6' : '#3f424d', boxShadow: step.current ? '0 0 12px rgba(59,130,246,0.4)' : 'none' }}>
                      {step.done ? <Check size={14} color="#fff"/> : step.current ? <Clock size={14} color="#fff"/> : <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#64748b' }}/>}
                    </div>
                    {i < steps.length - 1 && <div style={{ width:'2px', height:'32px', background: step.done ? '#10b981' : '#3f424d' }}/>}
                  </div>
                  <div style={{ paddingBottom:'16px' }}>
                    <div style={{ color: step.done ? '#fff' : step.current ? '#3b82f6' : '#64748b', fontWeight:600, fontSize:'0.9rem' }}>{step.label}</div>
                    {step.date && <div style={{ color:'#64748b', fontSize:'0.75rem' }}>{step.date}</div>}
                  </div>
                </div>
              ))}

              {selected.tracking_code && <div style={{ padding:'12px', background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'8px', marginTop:'8px' }}><span style={{ color:'#06b6d4', fontSize:'0.85rem', fontWeight:600 }}>📦 Rastreio: {selected.tracking_code}</span></div>}
            </div>

            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {(selected.status === 'awaiting_payment' || !selected.status) && <button onClick={() => updateStatus(selected.id, 'paid')} style={{ ...S.btn, background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.25)' }}><Lock size={16}/> Aprovar Pagamento</button>}
              {(selected.status === 'paid' || selected.status === 'awaiting_shipment') && <button onClick={() => updateStatus(selected.id, 'shipped', { tracking_code: 'BR' + Math.random().toString().slice(2,11) + 'CD' })} style={{ ...S.btn, background:'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}><Truck size={16}/> Simular Envio</button>}
              {selected.status === 'shipped' && <button onClick={() => updateStatus(selected.id, 'delivered')} style={{ ...S.btn, background:'linear-gradient(135deg,#06b6d4,#0891b2)' }}><Package size={16}/> Simular Entrega</button>}
              {selected.status === 'delivered' && <button onClick={() => updateStatus(selected.id, 'completed')} style={{ ...S.btn, background:'linear-gradient(135deg,#22c55e,#16a34a)' }}><CheckCircle size={16}/> Confirmar Recebimento</button>}
              {selected.status === 'delivered' && <button onClick={() => updateStatus(selected.id, 'dispute')} style={{ ...S.btn, background:'rgba(239,68,68,0.15)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)' }}><AlertTriangle size={16}/> Abrir Disputa</button>}
              {selected.status === 'dispute' && view === 'admin' && <>
                <button onClick={() => updateStatus(selected.id, 'refunded')} style={{ ...S.btn, background:'rgba(239,68,68,0.15)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)' }}><Ban size={16}/> Reembolso Total</button>
                <button onClick={() => updateStatus(selected.id, 'completed')} style={{ ...S.btn, background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)' }}><CheckCircle size={16}/> Liberar p/ Vendedor</button>
              </>}
            </div>
          </div>

          <div>
            <div style={{ ...S.card, padding:'20px', marginBottom:'16px' }}>
              <h4 style={{ color:'#fff', fontSize:'0.9rem', fontWeight:700, marginBottom:'16px', display:'flex', alignItems:'center', gap:'6px' }}><Wallet size={16} color="#8b5cf6"/> Resumo Financeiro</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                <div style={{ borderTop:'1px solid #3f424d', paddingTop:'10px', display:'flex', justifyContent:'space-between' }}><span style={{ color:'#fff', fontWeight:700 }}>Total Pago (Comprador)</span><span style={{ color:'#10b981', fontWeight:800, fontSize:'1.1rem' }}>{formatBRL(selected.total_price)}</span></div>
              </div>
            </div>
            
            <div style={{ ...S.card, padding:'20px', marginBottom:'16px' }}>
              <h4 style={{ color:'#fff', fontSize:'0.9rem', fontWeight:700, marginBottom:'16px', display:'flex', alignItems:'center', gap:'6px' }}><DollarSign size={16} color="#f59e0b"/> Decomposição</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#94a3b8', fontSize:'0.85rem' }}>Comissão Plataforma ({(selected.commission_rate*100).toFixed(0)}%)</span><span style={{ color:'#f59e0b', fontWeight:600 }}>-{formatBRL(selected.kings_fee)}</span></div>
                <div style={{ borderTop:'1px solid #3f424d', paddingTop:'10px', display:'flex', justifyContent:'space-between' }}><span style={{ color:'#fff', fontWeight:700 }}>Líquido Vendedor</span><span style={{ color:'#8b5cf6', fontWeight:800, fontSize:'1.1rem' }}>{formatBRL(selected.seller_net)}</span></div>
              </div>
            </div>
            
            <div style={{ ...S.card, padding:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#10b981', fontSize:'0.8rem' }}><Shield size={16}/><span style={{ fontWeight:600 }}>Pagamento protegido pelo cofre da plataforma</span></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAdminDash = () => {
    const completed = orders.filter(o => o.status === 'completed')
    const disputes = orders.filter(o => o.status === 'dispute')
    
    const totalRevenue = completed.reduce((s,o) => s + (o.kings_fee || 0), 0)
    const totalSales = completed.reduce((s,o) => s + (o.total_price || 0), 0)
    const escrowHeld = orders.filter(o => ['paid','awaiting_shipment','shipped','delivered'].includes(o.status)).reduce((s,o) => s + (o.total_price || 0), 0)

    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
          {[
            { label:'Vendas Concluídas', value: formatBRL(totalSales), color:'#10b981', icon:<TrendingUp size={18}/> },
            { label:'Receitas da MSU', value: formatBRL(totalRevenue), color:'#f59e0b', icon:<DollarSign size={18}/> },
            { label:'Cofre (Escrow)', value: formatBRL(escrowHeld), color:'#3b82f6', icon:<Lock size={18}/> },
            { label:'Disputas Abertas', value: disputes.length, color: disputes.length > 0 ? '#ef4444' : '#22c55e', icon:<AlertTriangle size={18}/> },
          ].map((kpi,i) => (
            <div key={i} style={{ ...S.card, padding:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}><span style={{ color:'#94a3b8', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>{kpi.label}</span><span style={{ color:kpi.color }}>{kpi.icon}</span></div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
        
        {disputes.length > 0 && (
          <div style={{ ...S.card, padding:'16px', marginBottom:'20px', borderColor:'rgba(239,68,68,0.3)' }}>
            <h4 style={{ color:'#ef4444', fontSize:'0.9rem', fontWeight:700, marginBottom:'12px' }}>🚨 Disputas Pendentes</h4>
            {disputes.map(d => (
              <div key={d.id} style={{ padding:'12px', background:'rgba(239,68,68,0.05)', borderRadius:'8px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div><div style={{ color:'#fff', fontWeight:600 }}>{d.listing?.title} — {d.id.split('-')[0]}</div></div>
                <button onClick={() => openDetail(d.id)} style={{ ...S.btn, padding:'6px 14px', background:'#ef4444', fontSize:'0.8rem' }}><Eye size={14}/> Mediar</button>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginBottom:'16px' }}>
          <span style={S.label}>Comissão Padrão da Plataforma</span>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'8px' }}>
            <input type="range" min={5} max={20} value={commissionRate} onChange={e => setCommissionRate(+e.target.value)} style={{ flex:1 }} />
            <span style={{ color:'#f59e0b', fontWeight:800, fontSize:'1.1rem', minWidth:'40px' }}>{commissionRate}%</span>
          </div>
        </div>
        
        {loading ? <div style={{ color: '#64748b', padding: '40px', textAlign: 'center' }}>Carregando dados financeiros reais...</div> : renderOrders()}
      </div>
    )
  }

  return (
    <div>
      {view === 'detail' ? renderDetail() : renderAdminDash()}
    </div>
  )
}
