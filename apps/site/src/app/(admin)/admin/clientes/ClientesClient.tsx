'use client'

import React, { useState } from 'react'
import { Search, Users, ShoppingBag, Mail, Phone, MapPin, Download, Calendar, UserCheck, UserX } from 'lucide-react'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  cpf_cnpj: string | null
  addresses: any
  created_at: string
  order_count: number
  total_spent: number
}

export function ClientesClient({ clients }: { clients: Client[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'with_orders' | 'without_orders'>('all')
  const [isExporting, setIsExporting] = useState(false)

  const filtered = clients.filter(c => {
    const matchSearch = (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.cpf_cnpj || '').includes(searchTerm)
    const matchFilter = filter === 'all' ||
      (filter === 'with_orders' && c.order_count > 0) ||
      (filter === 'without_orders' && c.order_count === 0)
    return matchSearch && matchFilter
  })

  const totalClients = clients.length
  const withOrders = clients.filter(c => c.order_count > 0).length
  const totalRevenue = clients.reduce((a, c) => a + c.total_spent, 0)

  async function exportCSV() {
    try {
      setIsExporting(true)
      const res = await fetch('/api/clientes/exportar')
      
      if (!res.ok) {
        let errorMessage = 'Erro ao exportar clientes.'
        try {
          const errorData = await res.json()
          if (errorData.error) errorMessage = errorData.error
        } catch (e) {}
        alert(errorMessage)
        return
      }

      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `clientes_loja_integrada_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error(error)
      alert('Erro inesperado ao gerar CSV.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Clientes</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Base de clientes cadastrados</p>
        </div>
        <button onClick={exportCSV} disabled={isExporting} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: isExporting ? '#64748b' : 'linear-gradient(135deg, #10b981, #059669)',
          border: 'none', borderRadius: '8px', padding: '10px 20px',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: isExporting ? 'not-allowed' : 'pointer',
          boxShadow: isExporting ? 'none' : '0 2px 8px rgba(16,185,129,0.3)',
          opacity: isExporting ? 0.7 : 1
        }}>
          <Download size={16} /> {isExporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Total Clientes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>{totalClients}</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Com Pedidos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '8px' }}>{withOrders}</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Sem Pedidos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '8px' }}>{totalClients - withOrders}</div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Receita Total</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22d3ee', marginTop: '8px', fontFamily: 'monospace' }}>R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid #3f424d' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="text" placeholder="Buscar por nome, email, telefone ou CPF..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '9px 12px 9px 36px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {([['all', 'Todos', Users], ['with_orders', 'Com Pedidos', UserCheck], ['without_orders', 'Sem Pedidos', UserX]] as const).map(([v, l, Icon]) => (
              <button key={v} onClick={() => setFilter(v as any)} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                border: filter === v ? '1px solid #10b981' : '1px solid #3f424d',
                background: filter === v ? '#10b98118' : 'transparent',
                color: filter === v ? '#10b981' : '#94a3b8'
              }}>
                <Icon size={14} /> {l}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.8rem' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Table */}
        <div className="admin-overflow-table">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                {['Cliente', 'Email', 'Telefone', 'CPF/CNPJ', 'Pedidos', 'Total Gasto', 'Cadastro'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#1f2025', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>Nenhum cliente encontrado.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #3f424d', transition: 'background 0.15s' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                        {(c.full_name || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{c.full_name || 'Sem nome'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{c.email || '-'}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{c.phone || '-'}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>{c.cpf_cnpj || '-'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                      background: c.order_count > 0 ? '#10b98118' : '#f59e0b18',
                      color: c.order_count > 0 ? '#10b981' : '#f59e0b',
                      border: `1px solid ${c.order_count > 0 ? '#10b98130' : '#f59e0b30'}`
                    }}>{c.order_count}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: c.total_spent > 0 ? '#10b981' : '#64748b', fontWeight: c.total_spent > 0 ? 600 : 400 }}>
                    R$ {c.total_spent.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
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
