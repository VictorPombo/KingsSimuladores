'use client'

import React, { useState, useTransition } from 'react'
import { Tag, Eye, EyeOff, Trash2, Edit3, Image as ImageIcon, ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toggleListingStatus, archiveListing } from './actions'

type Listing = {
  id: string; title: string; price: number; status: string
  images: string[]; created_at: string; condition?: string
  seller_id?: string
}

export function MsuClient({ initialListings }: { initialListings: Listing[] }) {
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? initialListings : initialListings.filter(l => l.status === filter)
  const activeCount = initialListings.filter(l => l.status === 'active').length
  const pendingCount = initialListings.filter(l => l.status === 'pending_review').length
  const rejectedCount = initialListings.filter(l => l.status === 'rejected').length

  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(async () => { await toggleListingStatus(id, currentStatus) })
  }

  const handleArchive = (id: string) => {
    if (confirm('Tem certeza que deseja remover este anúncio? Ele será ocultado de todas as vitrines.')) {
      startTransition(async () => { await archiveListing(id) })
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
      active: { label: 'Ativo', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
      pending_review: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
      rejected: { label: 'Rejeitado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
      sold: { label: 'Vendido', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    }
    const s = map[status] || { label: status, color: '#94a3b8', bg: '#94a3b815', border: '#94a3b830' }
    return (
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {s.label}
      </span>
    )
  }

  const getConditionLabel = (cond?: string) => {
    const map: Record<string, string> = { novo: 'Novo', like_new: 'Seminovo', good: 'Bom', fair: 'Usado' }
    return map[cond || ''] || cond || '—'
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={24} color="#06b6d4" /> Anúncios MSU
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Classificados submetidos por pilotos do marketplace</p>
        </div>
      </div>

      {/* Explainer */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#06b6d420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShoppingBag size={28} color="#06b6d4" /></div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Esta é a <strong style={{ color: '#cbd5e1' }}>central de classificados</strong> do Meu Simulador Usado. Aqui você vê todos os equipamentos cadastrados por vendedores, com seus status e pode pausar, reativar ou remover qualquer anúncio. <br/>
            <span style={{ color: '#64748b' }}>Exemplo: Um piloto anuncia um "Fanatec CSL DD" por R$ 3.500. Ele aparece como "Pendente" até você aprovar na aba de Moderação.</span>
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Ativos', value: activeCount, color: '#10b981', icon: CheckCircle },
          { label: 'Pendentes', value: pendingCount, color: '#f59e0b', icon: Clock },
          { label: 'Rejeitados', value: rejectedCount, color: '#ef4444', icon: XCircle },
          { label: 'Total', value: initialListings.length, color: '#06b6d4', icon: ShoppingBag },
        ].map((k, i) => (
          <div key={i} style={{ background: '#2c2e36', borderRadius: '12px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.icon size={20} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Ativos' },
          { key: 'pending_review', label: 'Pendentes' },
          { key: 'rejected', label: 'Rejeitados' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid',
            borderColor: filter === f.key ? '#06b6d4' : '#3f424d',
            background: filter === f.key ? '#06b6d415' : 'transparent',
            color: filter === f.key ? '#06b6d4' : '#94a3b8',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}>{f.label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div className="admin-overflow-table">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
            <thead>
              <tr>
                {['Produto', 'Preço', 'Estado', 'Status', 'Data', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', background: '#1f2025', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={36} color="#3f424d" />
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Nenhum anúncio encontrado</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Os classificados submetidos pelos pilotos aparecerão aqui.</p>
                  </div>
                </td></tr>
              ) : filtered.map(listing => (
                <tr key={listing.id} style={{ borderBottom: '1px solid #3f424d', opacity: isPending ? 0.5 : 1, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  
                  {/* Produto */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#1f2025', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ImageIcon size={18} color="#3f424d" />
                        )}
                      </div>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{listing.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', fontFamily: 'monospace', marginTop: '2px' }}>ID: {listing.id.split('-')[0]}</div>
                      </div>
                    </div>
                  </td>

                  {/* Preço */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>R$ {Number(listing.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {getConditionLabel(listing.condition)}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 20px' }}>{getStatusBadge(listing.status)}</td>

                  {/* Data */}
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(listing.created_at).toLocaleDateString('pt-BR')}
                  </td>

                  {/* Ações */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleToggle(listing.id, listing.status)}
                        title={listing.status === 'active' ? 'Pausar' : 'Reativar'}
                        style={{ background: listing.status === 'active' ? '#f59e0b15' : '#10b98115', border: `1px solid ${listing.status === 'active' ? '#f59e0b30' : '#10b98130'}`, color: listing.status === 'active' ? '#f59e0b' : '#10b981', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {listing.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => handleArchive(listing.id)} title="Remover"
                        style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
