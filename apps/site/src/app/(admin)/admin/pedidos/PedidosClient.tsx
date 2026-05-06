'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, ChevronDown, Eye, Truck, CreditCard, Package, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Download } from 'lucide-react'

type Order = {
  id: string
  brand_origin: string
  order_type: string
  status: string
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  payment_method: string
  tracking_code: string | null
  coupon_id: string | null
  created_at: string
  profiles: { full_name: string; email: string; phone: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: '#f59e0b', icon: Clock },
  paid: { label: 'Pago', color: '#10b981', icon: CreditCard },
  shipped: { label: 'Enviado', color: '#3b82f6', icon: Truck },
  delivered: { label: 'Entregue', color: '#22d3ee', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: '#ef4444', icon: XCircle },
  refunded: { label: 'Reembolsado', color: '#f97316', icon: RefreshCw },
}

export function PedidosClient({ orders }: { orders: Order[] }) {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch = o.id.includes(searchTerm) ||
      (o.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchBrand = brandFilter === 'all' || o.brand_origin === brandFilter
    return matchSearch && matchStatus && matchBrand
  })

  // KPIs
  const totalFaturado = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status)).reduce((a, o) => a + Number(o.total), 0)
  const totalPendente = orders.filter(o => o.status === 'pending').reduce((a, o) => a + Number(o.total), 0)
  const totalCancelado = orders.filter(o => o.status === 'cancelled').length

  function exportCSV() {
    if (!filtered.length) return
    const headers = ['Pedido', 'Data', 'Cliente', 'Email', 'Marca', 'Status', 'Subtotal', 'Frete', 'Desconto', 'Total', 'Pagamento', 'Rastreio']
    const rows = filtered.map(o => [
      '#' + o.id.split('-')[0],
      new Date(o.created_at).toLocaleDateString('pt-BR'),
      o.profiles?.full_name || '-',
      o.profiles?.email || '-',
      o.brand_origin === 'kings' ? 'Kings' : o.brand_origin === 'seven' ? 'Seven' : 'MSU',
      STATUS_CONFIG[o.status]?.label || o.status,
      Number(o.subtotal).toFixed(2),
      Number(o.shipping_cost).toFixed(2),
      Number(o.discount).toFixed(2),
      Number(o.total).toFixed(2),
      o.payment_method || '-',
      o.tracking_code || '-',
    ])
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(c => `"${c}"`).join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Listar Pedidos</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>{orders.length} pedidos no total</p>
        </div>
        <button onClick={exportCSV} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          border: 'none', borderRadius: '8px', padding: '10px 20px',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(16,185,129,0.3)', transition: 'transform 0.2s'
        }}
        onMouseEnter={(e: any) => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={(e: any) => e.currentTarget.style.transform = 'translateY(0)'}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Faturado</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '8px', fontFamily: 'monospace' }}>R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Pedidos pagos, enviados e entregues</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pendente</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '8px', fontFamily: 'monospace' }}>R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Aguardando pagamento</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cancelados</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginTop: '8px', fontFamily: 'monospace' }}>{totalCancelado}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Pedidos cancelados</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pedidos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginTop: '8px', fontFamily: 'monospace' }}>{orders.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>Todos os pedidos registrados</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #3f424d' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text" placeholder="Buscar por ID, cliente ou email..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px 9px 36px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Todos os Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
            style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Todas as Marcas</option>
            <option value="kings">Kings Simuladores</option>
            <option value="msu">Meu Simulador Usado</option>
            <option value="seven">Seven Sim Racing</option>
          </select>
          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="admin-overflow-table">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                {['Pedido', 'Data', 'Cliente', 'Marca', 'Subtotal', 'Frete', 'Desconto', 'Total', 'Status', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem',
                    fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase',
                    letterSpacing: '0.5px', background: '#1f2025', whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                  Nenhum pedido encontrado.
                </td></tr>
              ) : filtered.map(order => {
                const sc = STATUS_CONFIG[order.status] || { label: order.status, color: '#94a3b8', icon: AlertCircle }
                const StatusIcon = sc.icon
                const isExpanded = expandedOrder === order.id
                return (
                  <React.Fragment key={order.id}>
                    <tr
                      style={{ borderBottom: '1px solid #3f424d', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        #{order.id.split('-')[0]}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{order.profiles?.full_name || 'Desconhecido'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{order.profiles?.email || ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                          background: order.brand_origin === 'kings' ? '#3b82f620' : order.brand_origin === 'seven' ? '#ea580c20' : '#f59e0b20',
                          color: order.brand_origin === 'kings' ? '#3b82f6' : order.brand_origin === 'seven' ? '#ea580c' : '#f59e0b',
                          border: `1px solid ${order.brand_origin === 'kings' ? '#3b82f630' : order.brand_origin === 'seven' ? '#ea580c30' : '#f59e0b30'}`
                        }}>
                          {order.brand_origin === 'kings' ? 'KINGS' : order.brand_origin === 'seven' ? 'SEVEN' : 'MSU'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8' }}>
                        R$ {Number(order.subtotal).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b' }}>
                        R$ {Number(order.shipping_cost).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: Number(order.discount) > 0 ? '#ef4444' : '#64748b' }}>
                        {Number(order.discount) > 0 ? `-R$ ${Number(order.discount).toFixed(2)}` : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                        R$ {Number(order.total).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                          background: sc.color + '18', color: sc.color, border: `1px solid ${sc.color}30`
                        }}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <ChevronDown size={16} color="#64748b" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: '#1f2025' }}>
                        <td colSpan={10} style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', fontSize: '0.8rem' }}>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>ID Completo</div>
                              <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>{order.id}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Pagamento</div>
                              <div style={{ color: '#e2e8f0' }}>{order.payment_method || 'Não informado'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Rastreio</div>
                              <div style={{ color: order.tracking_code ? '#3b82f6' : '#64748b' }}>{order.tracking_code || 'Sem rastreio'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Tipo</div>
                              <div style={{ color: '#e2e8f0' }}>{order.order_type === 'direct' ? 'Venda Direta' : 'Marketplace'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Telefone</div>
                              <div style={{ color: '#e2e8f0' }}>{order.profiles?.phone || '-'}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Cupom</div>
                              <div style={{ color: order.coupon_id ? '#10b981' : '#64748b' }}>{order.coupon_id ? 'Sim' : 'Nenhum'}</div>
                            </div>
                          </div>
                          
                          {/* Botão do WhatsApp */}
                          {order.profiles?.phone && (
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #3f424d' }}>
                              <a
                                href={`https://wa.me/55${order.profiles.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Fala ${order.profiles.full_name?.split(' ')[0] || 'Cliente'}! Passando para avisar que seu pedido #${order.id.split('-')[0]} foi despachado. ${order.tracking_code ? `Acompanhe o rastreio: ${order.tracking_code}` : 'O código de rastreio será enviado em breve.'}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                                  background: '#25D366', color: '#fff', textDecoration: 'none',
                                  padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem',
                                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)', transition: 'transform 0.2s, background 0.2s'
                                }}
                                onMouseEnter={(e: any) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#22c35e'; }}
                                onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#25D366'; }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Notificar Envio no WhatsApp
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
