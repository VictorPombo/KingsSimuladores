'use client'

import React, { useState } from 'react'
import { ShoppingCart, Copy, Check, Link2, Clock, Trash2, Plus } from 'lucide-react'

type CartLink = {
  id: string
  customer_name: string
  items_count: number
  total: number
  created_at: string
  url: string
}

export default function LinkCarrinhoPage() {
  const [links, setLinks] = useState<CartLink[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  function copyLink(id: string, url: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Link de Carrinho</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Crie links pré-preenchidos para facilitar vendas diretas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          border: 'none', borderRadius: '8px', padding: '10px 20px',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
        }}>
          <Plus size={16} /> Criar Link
        </button>
      </div>

      {/* Info Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px',
        border: '1px solid #3f424d', padding: '32px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '24px'
      }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Link2 size={28} color="#3b82f6" />
        </div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px 0' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Crie um link com produtos pré-selecionados no carrinho. Envie para o cliente via WhatsApp, e-mail ou redes sociais.
            Quando ele acessar o link, o carrinho já estará preenchido e pronto para checkout. Ideal para vendas diretas e recuperação de carrinhos abandonados.
          </p>
        </div>
      </div>

      {/* Table de links */}
      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div className="admin-overflow-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Link', 'Cliente', 'Itens', 'Valor Total', 'Criado em', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#1f2025' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                  <ShoppingCart size={32} color="#3f424d" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 4px 0' }}>Nenhum link de carrinho criado ainda</p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Clique em "Criar Link" para começar a gerar links de venda direta.</p>
                </td></tr>
              ) : links.map(link => (
                <tr key={link.id} style={{ borderBottom: '1px solid #3f424d' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link2 size={14} color="#3b82f6" />
                      <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontFamily: 'monospace' }}>{link.url.slice(0, 40)}...</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '0.85rem' }}>{link.customer_name}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{link.items_count} produto{link.items_count !== 1 ? 's' : ''}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>R$ {link.total.toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(link.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => copyLink(link.id, link.url)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                        background: copiedId === link.id ? '#10b98118' : '#3b82f618', color: copiedId === link.id ? '#10b981' : '#3b82f6',
                        border: `1px solid ${copiedId === link.id ? '#10b98130' : '#3b82f630'}`, cursor: 'pointer'
                      }}>
                        {copiedId === link.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
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
