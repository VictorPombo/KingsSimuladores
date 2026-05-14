'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, ChevronDown, Eye, Truck, CreditCard, Package, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Download, ShoppingBag, MessageSquare, Edit2 } from 'lucide-react'
import { createClient } from '@kings/db/client'

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
  order_number?: number | null
  shipping_address?: {
    cep?: string
    bairro?: string
    cidade?: string
    numero?: string
    logradouro?: string
    referencia?: string
    complemento?: string
  } | null
  profiles: { full_name: string; email: string; phone: string; cpf_cnpj?: string | null } | null
  notes?: string | null
  erp_id?: string | null
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
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({})
  const [loadingItems, setLoadingItems] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState<string>('')
  const [savingTracking, setSavingTracking] = useState<string | null>(null)
  const [router] = [useRouter()]

  // Status change modal state
  const [statusModal, setStatusModal] = useState<{
    orderId: string
    currentStatus: string
    newStatus: string
    phone: string | null
    customerName: string
    message: string
    sendWhatsapp: boolean
  } | null>(null)
  const [savingStatus, setSavingStatus] = useState(false)

  const handleSaveTracking = async (orderId: string) => {
    setSavingTracking(orderId)
    try {
      const res = await fetch('/api/admin/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingCode: trackingInput })
      })
      if (res.ok) {
        alert('Rastreio salvo! Status atualizado para "Enviado".')
        router.refresh()
      } else {
        const data = await res.json()
        alert('Erro: ' + (data.error || 'Falha ao salvar'))
      }
    } catch {
      alert('Erro de conexão')
    } finally {
      setSavingTracking(null)
    }
  }

  const STATUS_MESSAGES: Record<string, string> = {
    paid: 'Olá, {nome}! 🏎️ Seu pedido #{id} foi confirmado e o pagamento aprovado com sucesso! Em breve você receberá mais informações sobre o envio.',
    shipped: 'Fala {nome}! 🚚 Seu pedido #{id} foi despachado! {tracking}\n\nAcompanhe a entrega e qualquer dúvida estamos à disposição. Grande abraço da equipe Kings!',
    delivered: 'Olá {nome}! ✅ Confirmamos a entrega do seu pedido #{id}. Esperamos que aproveite muito! Se precisar de suporte, é só chamar.',
    cancelled: 'Olá {nome}, \n\nInformamos que seu pedido #{id} foi cancelado. O estorno será processado automaticamente para o seu cartão/conta em até 2 faturas/dias úteis, conforme política da operadora.\n\nPedimos desculpas pelo inconveniente. Estamos à disposição!',
    refunded: 'Olá {nome}! O reembolso do pedido #{id} foi processado. O valor será creditado conforme as políticas da sua operadora financeira. Qualquer dúvida, estamos aqui!',
    pending: 'Olá {nome}, seu pedido #{id} está aguardando confirmação de pagamento. Assim que confirmado, você receberá uma nova notificação.',
  }

  const openStatusModal = (order: Order, newStatus: string) => {
    const template = STATUS_MESSAGES[newStatus] || `Seu pedido #{id} teve o status atualizado para: ${STATUS_CONFIG[newStatus]?.label || newStatus}.`
    const trackingInfo = order.tracking_code ? `Código de rastreio: ${order.tracking_code}` : 'O código de rastreio será enviado em breve.'
    const orderId = order.order_number ? `#${order.order_number}` : `#${order.id.split('-')[0]}`
    const message = template
      .replace(/{nome}/g, order.profiles?.full_name?.split(' ')[0] || 'Cliente')
      .replace(/{id}/g, orderId)
      .replace(/{tracking}/g, trackingInfo)
    setStatusModal({
      orderId: order.id,
      currentStatus: order.status,
      newStatus,
      phone: order.profiles?.phone || null,
      customerName: order.profiles?.full_name || 'Cliente',
      message,
      sendWhatsapp: !!order.profiles?.phone,
    })
  }

  const handleConfirmStatusChange = async () => {
    if (!statusModal) return
    setSavingStatus(true)
    try {
      const res = await fetch('/api/admin/pedidos/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: statusModal.orderId,
          newStatus: statusModal.newStatus,
          sendWhatsapp: statusModal.sendWhatsapp,
          phone: statusModal.phone,
          message: statusModal.message,
          customerName: statusModal.customerName,
        })
      })
      if (res.ok) {
        setStatusModal(null)
        router.refresh()
      } else {
        const data = await res.json()
        alert('Erro: ' + (data.error || 'Falha ao atualizar status'))
      }
    } catch {
      alert('Erro de conexão')
    } finally {
      setSavingStatus(false)
    }
  }

  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [deletingOrder, setDeletingOrder] = useState(false)

  const confirmDeleteOrder = async () => {
    if (!deleteModal) return
    setDeletingOrder(true)
    
    try {
      const res = await fetch('/api/admin/pedidos/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: deleteModal })
      })
      if (res.ok) {
        setDeleteModal(null)
        setExpandedOrder(null)
        router.refresh()
      } else {
        const data = await res.json()
        alert('Erro ao excluir pedido: ' + (data.error || 'Erro desconhecido'))
      }
    } catch {
      alert('Erro de conexão ao tentar excluir')
    } finally {
      setDeletingOrder(false)
    }
  }

  const handleGenerateInvoice = async (orderId: string) => {
    if (!confirm('Deseja enviar este pedido para o ERP (Tiny/Olist) para gerar a Nota Fiscal?')) return
    
    try {
      const res = await fetch('/api/admin/pedidos/sync-erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      if (res.ok) {
        alert('Enviado com sucesso! A Nota Fiscal ficará com status Pendente até ser emitida pelo ERP.')
        router.refresh()
      } else {
        const data = await res.json()
        alert('Erro ao gerar Nota: ' + (data.error || 'Erro desconhecido'))
      }
    } catch {
      alert('Erro de conexão ao tentar gerar a nota')
    }
  }

  const handleExpand = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }
    setExpandedOrder(orderId)
    // Fetch items if not already cached
    if (!orderItems[orderId]) {
      setLoadingItems(orderId)
      try {
        const supabase = createClient()
        const { data: items } = await supabase
          .from('order_items')
          .select('id, quantity, unit_price, total_price, store_origin, product:product_id(title, sku, images, dimensions_cm, weight_kg)')
          .eq('order_id', orderId)
        setOrderItems(prev => ({ ...prev, [orderId]: items || [] }))
      } catch (err) {
        console.error('Erro ao carregar itens:', err)
      } finally {
        setLoadingItems(null)
      }
    }
  }

  const filtered = orders.filter(o => {
    const searchString = searchTerm.toLowerCase()
    const matchSearch = o.id.includes(searchString) ||
      (o.order_number && String(o.order_number).includes(searchString)) ||
      (o.profiles?.full_name || '').toLowerCase().includes(searchString) ||
      (o.profiles?.email || '').toLowerCase().includes(searchString)
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
      o.order_number ? '#' + o.order_number : '#' + o.id.split('-')[0],
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

      {/* ── Delete Modal ── */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e2030', border: '1px solid #ef444450', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: '#ef444420', padding: '16px', borderRadius: '50%', color: '#ef4444' }}>
                <AlertCircle size={32} />
              </div>
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px 0' }}>Excluir Pedido</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Tem certeza absoluta que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteModal(null)} style={{ flex: 1, background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', padding: '11px', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
              <button
                onClick={confirmDeleteOrder}
                disabled={deletingOrder}
                style={{ flex: 1, background: deletingOrder ? '#3f424d' : '#ef4444', border: 'none', borderRadius: '8px', padding: '11px', color: '#fff', cursor: deletingOrder ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}
              >
                {deletingOrder ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Change Modal ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e2030', border: '1px solid #3f424d', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Alterar Status do Pedido</h3>
              <button onClick={() => setStatusModal(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}><XCircle size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: (STATUS_CONFIG[statusModal.currentStatus]?.color || '#94a3b8') + '18', color: STATUS_CONFIG[statusModal.currentStatus]?.color || '#94a3b8', border: `1px solid ${(STATUS_CONFIG[statusModal.currentStatus]?.color || '#94a3b8')}30` }}>
                {STATUS_CONFIG[statusModal.currentStatus]?.label || statusModal.currentStatus}
              </span>
              <span style={{ color: '#64748b' }}>→</span>
              <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: (STATUS_CONFIG[statusModal.newStatus]?.color || '#94a3b8') + '25', color: STATUS_CONFIG[statusModal.newStatus]?.color || '#94a3b8', border: `1px solid ${(STATUS_CONFIG[statusModal.newStatus]?.color || '#94a3b8')}50` }}>
                {STATUS_CONFIG[statusModal.newStatus]?.label || statusModal.newStatus}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Mensagem para o Cliente</label>
              <textarea
                value={statusModal.message}
                onChange={(e) => setStatusModal(prev => prev ? { ...prev, message: e.target.value } : null)}
                rows={5}
                style={{ width: '100%', background: '#131620', border: '1px solid #3f424d', borderRadius: '8px', padding: '12px', color: '#e2e8f0', fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
              />
            </div>

            {statusModal.phone ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '20px', padding: '12px', background: statusModal.sendWhatsapp ? 'rgba(37,211,102,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: statusModal.sendWhatsapp ? '1px solid rgba(37,211,102,0.3)' : '1px solid #3f424d', transition: 'all 0.2s' }}>
                <input type="checkbox" checked={statusModal.sendWhatsapp} onChange={(e) => setStatusModal(prev => prev ? { ...prev, sendWhatsapp: e.target.checked } : null)} style={{ accentColor: '#25D366', width: '16px', height: '16px' }} />
                <div>
                  <div style={{ color: '#25D366', fontWeight: 600, fontSize: '0.85rem' }}>📲 Enviar via WhatsApp</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{statusModal.phone}</div>
                </div>
              </label>
            ) : (
              <div style={{ marginBottom: '20px', padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', color: '#f59e0b', fontSize: '0.8rem' }}>
                ⚠️ Telefone não cadastrado — mensagem não será enviada
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStatusModal(null)} style={{ flex: 1, background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', padding: '11px', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancelar</button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={savingStatus}
                style={{ flex: 2, background: savingStatus ? '#3f424d' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', padding: '11px', color: '#fff', cursor: savingStatus ? 'wait' : 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s' }}
              >
                {savingStatus ? 'Salvando...' : '✓ Confirmar Mudança de Status'}
              </button>
            </div>
          </div>
        </div>
      )}
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
                      onClick={() => handleExpand(order.id)}
                      onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {order.order_number ? `#${order.order_number}` : `#${order.id.split('-')[0]}`}
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
                          {/* Itens do Pedido */}
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ShoppingBag size={14} color="#00e5ff" /> Produtos Comprados
                            </div>
                            {loadingItems === order.id ? (
                              <div style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem' }}>Carregando itens...</div>
                            ) : (orderItems[order.id] || []).length === 0 ? (
                              <div style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem' }}>Nenhum item encontrado.</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {(orderItems[order.id] || []).map((item: any, idx: number) => (
                                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', background: '#2c2e36', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      {item.product?.images?.[0] ? (
                                        <img src={item.product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <Package size={16} color="#64748b" />
                                      )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ color: '#e2e8f0', fontSize: '0.83rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.title || 'Produto'}</div>
                                      <div style={{ color: '#64748b', fontSize: '0.73rem', marginTop: '2px' }}>
                                        {item.product?.sku && <span style={{ fontFamily: 'monospace' }}>{item.product.sku}</span>}
                                        {item.product?.sku && ' · '}
                                        {item.quantity}x R$ {Number(item.unit_price).toFixed(2)}
                                        {item.product?.dimensions_cm && (
                                          <span style={{ marginLeft: '8px', padding: '2px 6px', background: '#3f424d', borderRadius: '4px', fontSize: '0.65rem', color: '#e2e8f0' }}>
                                            {item.product.dimensions_cm.width}x{item.product.dimensions_cm.height}x{item.product.dimensions_cm.length}cm
                                          </span>
                                        )}
                                        {item.product?.weight_kg && (
                                          <span style={{ marginLeft: '4px', padding: '2px 6px', background: '#3f424d', borderRadius: '4px', fontSize: '0.65rem', color: '#e2e8f0' }}>
                                            {item.product.weight_kg}kg
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 'bold', color: '#00e5ff', flexShrink: 0 }}>
                                      R$ {Number(item.total_price).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Detalhes do Pedido */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', fontSize: '0.8rem', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Cliente</div>
                              <div style={{ color: '#e2e8f0', fontWeight: 500 }}>{order.profiles?.full_name || 'Desconhecido'}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{order.profiles?.email || ''}</div>
                              {order.profiles?.cpf_cnpj && (
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Doc: {order.profiles.cpf_cnpj}</div>
                              )}
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Pagamento</div>
                              <div style={{ color: '#e2e8f0', fontWeight: 500 }}>
                                {(() => {
                                  const pm = (order.payment_method || '').toLowerCase();
                                  if (pm === 'pix') return 'PIX (Mercado Pago)';
                                  if (['master', 'visa', 'amex', 'hipercard', 'elo', 'credit_card'].includes(pm)) return `Cartão de Crédito (${pm.toUpperCase()})`;
                                  if (pm === 'ticket' || pm === 'boleto') return 'Boleto (Mercado Pago)';
                                  return pm ? pm.toUpperCase() : 'Não informado';
                                })()}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>ID Completo</div>
                              <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>{order.id}</div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Truck size={13} /> Informações de Envio (Frenet)
                              </div>
                              <div style={{ background: '#1a1c23', borderRadius: '8px', border: '1px solid #3f424d', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                                <div>
                                  <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Modalidade</div>
                                  <div style={{ color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 500 }}>
                                    {order.notes
                                      ? order.notes.replace('Frete: ', '')
                                      : Number(order.shipping_cost) > 0
                                        ? 'Via Frenet'
                                        : 'Retirada no Local'}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Preço do Frete</div>
                                  <div style={{ color: Number(order.shipping_cost) > 0 ? '#22d3ee' : '#10b981', fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                    {Number(order.shipping_cost) > 0 ? `R$ ${Number(order.shipping_cost).toFixed(2)}` : 'Grátis'}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Destino</div>
                                  <div style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>
                                    {order.shipping_address?.cidade || order.shipping_address?.bairro || '—'}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Status do Envio</div>
                                  {(() => {
                                    if (order.status === 'delivered') return <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>● Entregue</span>;
                                    if (order.status === 'shipped') return <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 }}>● {order.tracking_code ? 'Postado / Em trânsito' : 'Enviado'}</span>;
                                    if (order.status === 'cancelled') return <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>● Cancelado</span>;
                                    if (order.status === 'paid') return <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>● Aguardando Envio</span>;
                                    return <span style={{ color: '#64748b', fontSize: '0.8rem' }}>● {order.status}</span>;
                                  })()}
                                </div>
                                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                                  <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Código de Rastreio</div>
                                  {order.tracking_code ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <code style={{ color: '#22d3ee', fontSize: '0.85rem', fontWeight: 'bold', background: 'rgba(34,211,238,0.08)', padding: '4px 10px', borderRadius: '4px' }}>
                                        {order.tracking_code}
                                      </code>
                                      <a
                                        href={`https://rastreio.frenet.com.br/COR/${order.tracking_code}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#3b82f6', fontSize: '0.75rem', textDecoration: 'underline' }}
                                      >
                                        Rastrear na Frenet →
                                      </a>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        placeholder="Cole o código de rastreio aqui..."
                                        value={expandedOrder === order.id ? trackingInput : ''}
                                        onChange={(e) => setTrackingInput(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                          background: '#2a2d35', border: '1px solid #3f424d', borderRadius: '6px',
                                          padding: '6px 12px', color: '#e2e8f0', fontSize: '0.8rem', width: '260px',
                                          fontFamily: 'monospace'
                                        }}
                                      />
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleSaveTracking(order.id); }}
                                        disabled={!trackingInput || savingTracking === order.id}
                                        style={{
                                          background: trackingInput ? '#3b82f6' : '#3f424d', color: '#fff',
                                          border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: trackingInput ? 'pointer' : 'default',
                                          fontSize: '0.75rem', fontWeight: 'bold', whiteSpace: 'nowrap', transition: 'all 0.2s'
                                        }}
                                      >
                                        {savingTracking === order.id ? 'Salvando...' : '📦 Salvar Rastreio'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
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
                            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '8px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                <div>
                                  <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Endereço de Entrega</div>
                                  {order.shipping_address ? (
                                    <div style={{ color: '#e2e8f0', fontSize: '0.75rem', lineHeight: '1.4' }}>
                                      {order.shipping_address.logradouro}, {order.shipping_address.numero} {order.shipping_address.complemento ? ` - ${order.shipping_address.complemento}` : ''}<br />
                                      {order.shipping_address.bairro} - {order.shipping_address.cidade}<br />
                                      CEP: {order.shipping_address.cep}
                                    </div>
                                  ) : (
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Endereço não informado no pedido</div>
                                  )}
                                </div>
                                <div>
                                  <div style={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>Resumo de Valores</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                      <span>Subtotal:</span>
                                      <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                      <span>Frete:</span>
                                      <span>R$ {Number(order.shipping_cost).toFixed(2)}</span>
                                    </div>
                                    {Number(order.discount) > 0 && (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                                        <span>Desconto:</span>
                                        <span>-R$ {Number(order.discount).toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontWeight: 'bold', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                      <span>Total Pago:</span>
                                      <span>R$ {Number(order.total).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                              {/* ── Ações do Pedido ── */}
                              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #3f424d' }}>
                                {/* Linha 1: Alterar Status */}
                                <div style={{ marginBottom: '12px' }}>
                                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Edit2 size={12} /> Alterar Status Manualmente
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {Object.entries(STATUS_CONFIG)
                                      .filter(([k]) => k !== order.status)
                                      .map(([k, v]) => (
                                        <button
                                          key={k}
                                          onClick={(e) => { e.stopPropagation(); openStatusModal(order, k); }}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: v.color + '15', color: v.color,
                                            border: `1px solid ${v.color}40`,
                                            padding: '6px 14px', borderRadius: '8px',
                                            fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
                                            transition: 'all 0.2s'
                                          }}
                                          onMouseEnter={(e: any) => { e.currentTarget.style.background = v.color + '28'; }}
                                          onMouseLeave={(e: any) => { e.currentTarget.style.background = v.color + '15'; }}
                                        >
                                          {React.createElement(v.icon, { size: 12 })} {v.label}
                                        </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Linha 2: Botões de Ação */}
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {order.profiles?.phone && (
                                    <a
                                      href={`https://wa.me/55${order.profiles.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Fala ${order.profiles.full_name?.split(' ')[0] || 'Cliente'}! Passando para avisar que seu pedido ${order.order_number ? '#' + order.order_number : '#' + order.id.split('-')[0]} foi despachado. ${order.tracking_code ? `Acompanhe o rastreio: ${order.tracking_code}` : 'O código de rastreio será enviado em breve.'}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
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
                                  )}

                                  {!order.erp_id && ['paid', 'shipped', 'delivered'].includes(order.status) && (
                                    <button
                                      onClick={() => handleGenerateInvoice(order.id)}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        background: '#10b981', color: '#fff', border: 'none',
                                        padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                      }}
                                      onMouseEnter={(e: any) => { e.currentTarget.style.background = '#059669'; }}
                                      onMouseLeave={(e: any) => { e.currentTarget.style.background = '#10b981'; }}
                                    >
                                      <Package size={18} />
                                      Gerar NF-e (ERP)
                                    </button>
                                  )}

                                  {/* Cancelar Pedido (atalho rápido) */}
                                  {order.status !== 'cancelled' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openStatusModal(order, 'cancelled'); }}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        background: 'transparent', color: '#ef4444', border: '1px solid #ef4444',
                                        padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                      }}
                                      onMouseEnter={(e: any) => { e.currentTarget.style.background = '#ef444410'; }}
                                      onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                      <XCircle size={18} /> Cancelar Pedido
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteModal(order.id); }}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                                      background: 'transparent', color: '#64748b', border: '1px solid #3f424d',
                                      padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem',
                                      cursor: 'pointer', transition: 'all 0.2s', marginLeft: 'auto'
                                    }}
                                    onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(100,116,139,0.1)'; }}
                                    onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    Excluir Registro
                                  </button>
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
