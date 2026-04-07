'use client'

import React, { useState } from 'react'
import { Search, FileText, Download, CheckCircle, Clock, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'

type Invoice = {
  id: string
  nfe_number: string | null
  nfe_key: string | null
  status: string
  xml_url: string | null
  pdf_url: string | null
  issued_at: string | null
  created_at: string
  cnpj_emitente: string
  order_id: string
  order_total: number
  order_status: string
  customer_name: string
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: '#f59e0b', icon: Clock },
  issued: { label: 'Emitida', color: '#10b981', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: '#ef4444', icon: XCircle },
  error: { label: 'Erro', color: '#ef4444', icon: AlertTriangle },
}

export function NotasFiscaisClient({ invoices }: { invoices: Invoice[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = invoices.filter(inv => {
    const matchSearch = (inv.nfe_number || '').includes(searchTerm) ||
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.order_id.includes(searchTerm) ||
      (inv.nfe_key || '').includes(searchTerm)
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  const emitidas = invoices.filter(i => i.status === 'issued').length
  const pendentes = invoices.filter(i => i.status === 'pending').length

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Notas Fiscais
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f630' }}>BETA</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Gestão de NF-e vinculadas aos pedidos</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Total NF-e</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>{invoices.length}</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Emitidas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '8px' }}>{emitidas}</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Pendentes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '8px' }}>{pendentes}</div>
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #3f424d' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="text" placeholder="Buscar por número, chave ou cliente..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px 9px 36px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}>
            <option value="all">Todos os Status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                {['NF-e', 'Pedido', 'Cliente', 'CNPJ Emitente', 'Valor Pedido', 'Status', 'Emissão', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#1f2025', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  <FileText size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                  {invoices.length === 0 ? 'Nenhuma nota fiscal registrada ainda.' : 'Nenhum resultado encontrado.'}
                </td></tr>
              ) : filtered.map(inv => {
                const sc = STATUS_MAP[inv.status] || STATUS_MAP.pending
                const StatusIcon = sc.icon
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #3f424d', transition: 'background 0.15s' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0' }}>
                      {inv.nfe_number || <span style={{ color: '#64748b', fontStyle: 'italic' }}>Pendente</span>}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8' }}>
                      #{inv.order_id.split('-')[0]}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '0.85rem' }}>{inv.customer_name}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{inv.cnpj_emitente}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                      R$ {inv.order_total.toFixed(2)}
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
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {inv.pdf_url && (
                          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                            background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430', textDecoration: 'none'
                          }}>PDF <ExternalLink size={10} /></a>
                        )}
                        {inv.xml_url && (
                          <a href={inv.xml_url} target="_blank" rel="noopener noreferrer" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                            background: '#3b82f618', color: '#3b82f6', border: '1px solid #3b82f630', textDecoration: 'none'
                          }}>XML <ExternalLink size={10} /></a>
                        )}
                        {!inv.pdf_url && !inv.xml_url && <span style={{ color: '#64748b', fontSize: '0.75rem' }}>—</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
