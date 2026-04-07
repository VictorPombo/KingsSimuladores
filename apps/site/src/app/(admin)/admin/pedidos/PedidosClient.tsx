'use client'

import React, { useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch = o.id.includes(searchTerm) ||
      o.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      o.brand_origin === 'kings' ? 'Kings' : 'MSU',
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
          </select>
          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
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
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{order.profiles?.full_name || 'Desconhecido'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{order.profiles?.email || ''}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                          background: order.brand_origin === 'kings' ? '#3b82f620' : '#f59e0b20',
                          color: order.brand_origin === 'kings' ? '#3b82f6' : '#f59e0b',
                          border: `1px solid ${order.brand_origin === 'kings' ? '#3b82f630' : '#f59e0b30'}`
                        }}>
                          {order.brand_origin === 'kings' ? 'KINGS' : 'MSU'}
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
