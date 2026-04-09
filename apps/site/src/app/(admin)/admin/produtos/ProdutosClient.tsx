'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { Search, Plus, Package, Edit2, Trash2, Download, Image, AlertCircle, Power } from 'lucide-react'
import { toggleProductStatus, deleteProduct } from './actions'

type Product = {
  id: string; title: string; slug: string; sku: string | null; price: number; price_compare: number | null
  stock: number; status: string; weight_kg: number | null; images: string[]; created_at: string
  brand_name: string; category_name: string | null
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: '#10b981' },
  draft: { label: 'Rascunho', color: '#f59e0b' },
  archived: { label: 'Arquivado', color: '#64748b' },
}

export function ProdutosClient({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleToggleStatus = (id: string, current: string) => {
    if (confirm(current === 'active' ? 'Desativar este produto?' : 'Ativar este produto?')) {
      startTransition(() => { toggleProductStatus(id, current) })
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchStock = stockFilter === 'all' ||
      (stockFilter === 'in_stock' && p.stock > 0) ||
      (stockFilter === 'out_of_stock' && p.stock === 0)
    return matchSearch && matchStatus && matchStock
  })

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'active').length
  const outOfStock = products.filter(p => p.stock === 0).length
  const totalValue = products.reduce((a, p) => a + p.price * p.stock, 0)

  function exportCSV() {
    const headers = ['Produto', 'SKU', 'Slug', 'Preço', 'Preço Comparativo', 'Estoque', 'Status', 'Peso (kg)', 'Marca', 'Categoria', 'Criado em']
    const rows = filtered.map(p => [
      p.title, p.sku || '-', p.slug, `R$ ${p.price.toFixed(2)}`, p.price_compare ? `R$ ${p.price_compare.toFixed(2)}` : '-',
      String(p.stock), STATUS_MAP[p.status]?.label || p.status, p.weight_kg || '-', p.brand_name, p.category_name || '-',
      new Date(p.created_at).toLocaleDateString('pt-BR')
    ])
    const csv = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.map(c => `"${c}"`).join(';'))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `produtos_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  // ── Shared badge render ──
  const renderBrandBadge = (brand: string) => {
    const isKings = brand === 'Kings Simuladores'
    return (
      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
        background: isKings ? '#3b82f615' : '#f59e0b15',
        color: isKings ? '#3b82f6' : '#f59e0b',
        border: `1px solid ${isKings ? '#3b82f625' : '#f59e0b25'}`
      }}>{isKings ? 'KINGS' : 'MSU'}</span>
    )
  }

  const renderStatusBadge = (status: string) => {
    const sc = STATUS_MAP[status] || { label: status, color: '#94a3b8' }
    return (
      <span style={{
        display: 'inline-flex', padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
        background: sc.color + '18', color: sc.color, border: `1px solid ${sc.color}30`
      }}>{sc.label}</span>
    )
  }

  const renderStockBadge = (stock: number) => (
    <span style={{
      padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
      background: stock > 0 ? '#10b98118' : '#ef444418', color: stock > 0 ? '#10b981' : '#ef4444',
      border: `1px solid ${stock > 0 ? '#10b98130' : '#ef444430'}`
    }}>{stock} un.</span>
  )

  const renderActions = (p: Product) => {
    const sc = STATUS_MAP[p.status] || { label: p.status, color: '#94a3b8' }
    return (
      <div style={{ display: 'flex', gap: '8px', opacity: isPending ? 0.5 : 1 }}>
        <button title="Editar" onClick={() => alert('Edição completa será construída em breve!')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <Edit2 size={14} />
        </button>
        <button title={p.status === 'active' ? 'Desativar' : 'Ativar'} onClick={() => handleToggleStatus(p.id, p.status)}
          style={{ background: p.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${p.status === 'active' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`, borderRadius: '6px', color: p.status === 'active' ? '#ef4444' : '#10b981', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <Power size={14} />
        </button>
        <button title="Remover" onClick={() => handleDeleteClick(p.id)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#64748b', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <Trash2 size={14} />
        </button>
      </div>
    )
  }

  const renderProductImage = (p: Product, size = 40) => (
    p.images && p.images.length > 0 ? (
      <img src={p.images[0]} alt={p.title} style={{ width: size, height: size, objectFit: 'cover', borderRadius: '8px', border: '1px solid #3f424d' }} />
    ) : (
      <div style={{ width: size, height: size, background: '#1f2025', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #3f424d' }}>
        <Image size={size * 0.4} color="#3f424d" />
      </div>
    )
  )

  // ── MOBILE CARD LAYOUT ──
  const renderMobileCards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {filtered.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
          <Package size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
          Nenhum produto encontrado.
        </div>
      ) : filtered.map(p => (
        <div key={p.id} style={{
          background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '16px',
          transition: 'border-color 0.2s',
        }}>
          {/* Top row: image + title + brand */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            {renderProductImage(p, 48)}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {renderBrandBadge(p.brand_name)}
                {p.sku && <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b' }}>{p.sku}</span>}
              </div>
            </div>
          </div>

          {/* Middle row: price, stock, status, created */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px', padding: '12px', background: '#1f2025', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Preço</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700 }}>R$ {p.price.toFixed(2)}</div>
              {p.price_compare && <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b', textDecoration: 'line-through' }}>R$ {p.price_compare.toFixed(2)}</div>}
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Estoque</div>
              {renderStockBadge(p.stock)}
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Status</div>
              {renderStatusBadge(p.status)}
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Criado</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          {/* Bottom row: actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {renderActions(p)}
          </div>
        </div>
      ))}
    </div>
  )

  // ── DESKTOP TABLE LAYOUT ──
  const renderDesktopTable = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['', 'Produto', 'SKU', 'Marca', 'Preço', 'Estoque', 'Status', 'Criado', 'Ações'].map((h, i) => (
              <th key={i} style={{
                padding: '12px 16px', textAlign: i === 8 ? 'right' : 'left',
                fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.5px', background: '#1f2025',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <Package size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              Nenhum produto encontrado.
            </td></tr>
          ) : filtered.map(p => {
            const sc = STATUS_MAP[p.status] || { label: p.status, color: '#94a3b8' }
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #3f424d', transition: 'background 0.15s' }}
                onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', width: '56px' }}>
                  {renderProductImage(p)}
                </td>
                <td style={{ padding: '12px 16px', maxWidth: '220px' }}>
                  <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.slug}</div>
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.sku || '-'}</td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {renderBrandBadge(p.brand_name)}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>R$ {p.price.toFixed(2)}</div>
                  {p.price_compare && <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b', textDecoration: 'line-through' }}>R$ {p.price_compare.toFixed(2)}</div>}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {renderStockBadge(p.stock)}
                </td>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                  {renderStatusBadge(p.status)}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {renderActions(p)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Listar Produtos</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Inventário completo Kings e MSU</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', padding: '10px 16px', color: '#cbd5e1', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>
            <Download size={16} /> Exportar
          </button>
          <a href="/admin/criar-produto" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', boxShadow: '0 2px 8px rgba(139,92,246,0.3)' }}>
            <Plus size={16} /> Novo Produto
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Produtos', value: totalProducts, color: '#fff' },
          { label: 'Ativos', value: activeProducts, color: '#10b981' },
          { label: 'Sem Estoque', value: outOfStock, color: '#ef4444' },
          { label: 'Valor em Estoque', value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#22d3ee', mono: true },
        ].map((kpi, i) => (
          <div key={i} style={{ background: '#2c2e36', borderRadius: '10px', padding: '16px', border: '1px solid #3f424d' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
            <div style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 'bold', color: kpi.color, marginTop: '6px', fontFamily: (kpi as any).mono ? 'monospace' : 'inherit' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #3f424d' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="text" placeholder="Buscar por nome ou SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px 9px 36px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Todos os Status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
            style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Todo Estoque</option>
            <option value="in_stock">Em estoque</option>
            <option value="out_of_stock">Sem estoque</option>
          </select>
          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Content: Mobile Cards or Desktop Table */}
        <div style={{ padding: isMobile ? '12px' : '0' }}>
          {isMobile ? renderMobileCards() : renderDesktopTable()}
        </div>
      </div>

      {/* Modal de Confirmação de Deleção */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1f2025', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #3f424d', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <AlertCircle color="#ef4444" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.2rem' }}>Deseja remover este produto?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
              Esta ação enviará o produto para a lixeira (arquivado) e ele não aparecerá mais no catálogo KINGS ou MSU. Tem certeza absoluta?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{ background: 'transparent', color: '#fff', border: '1px solid #3f424d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  startTransition(() => { deleteProduct(deleteConfirmId); setDeleteConfirmId(null) })
                }}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
              >
                {isPending ? 'Removendo...' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
