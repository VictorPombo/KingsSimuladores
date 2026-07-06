'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingCart, Copy, Check, Link2, Trash2, Plus, ExternalLink, Clock, CheckCircle } from 'lucide-react'
import { createClient } from '@kings/db/client'

type CartLink = {
  id: string
  token: string
  customer_name: string | null
  items: any[]
  discount: number
  coupon_code: string | null
  expires_at: string
  used_at: string | null
  created_at: string
}

export default function LinkCarrinhoPage() {
  const [links, setLinks] = useState<CartLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const supabase = createClient()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    loadLinks()
  }, [])

  async function loadLinks() {
    setLoading(true)
    const { data } = await supabase
      .from('cart_links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setLinks(data || [])
    setLoading(false)
  }

  function getStatus(link: CartLink): { label: string; color: string; icon: React.ReactNode } {
    if (link.used_at) return { label: 'Usado', color: '#10b981', icon: <CheckCircle size={14} /> }
    if (new Date(link.expires_at) < new Date()) return { label: 'Expirado', color: '#ef4444', icon: <Clock size={14} /> }
    return { label: 'Ativo', color: '#3b82f6', icon: <Link2 size={14} /> }
  }

  function getUrl(token: string) {
    return `${baseUrl}/carrinho/${token}`
  }

  function copyLink(id: string, token: string) {
    navigator.clipboard.writeText(getUrl(token))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function deleteLink(id: string) {
    if (!confirm('Excluir este link de carrinho?')) return
    await supabase.from('cart_links').delete().eq('id', id)
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const itemsCount = (items: any[]) => items?.reduce((a: number, i: any) => a + (i.quantity || 1), 0) || 0
  const totalValue = (items: any[]) => items?.reduce((a: number, i: any) => a + (i.price * (i.quantity || 1)), 0) || 0

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Link de Carrinho</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Links pré-preenchidos para vendas diretas via WhatsApp</p>
        </div>
        <a href="/admin/criar-pedido" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          border: 'none', borderRadius: '8px', padding: '10px 20px',
          color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)', textDecoration: 'none',
        }}>
          <Plus size={16} /> Criar Link
        </a>
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
            Crie um link com produtos pré-selecionados em <strong style={{ color: '#cbd5e1' }}>Criar Pedido → Gerar Link de Pagamento</strong>.
            Envie para o cliente via WhatsApp. Quando ele abrir, o carrinho já estará montado e pronto para checkout.
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div className="admin-overflow-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Status', 'Cliente', 'Itens', 'Valor', 'Cupom', 'Criado em', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#1f2025' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Carregando...</td></tr>
              ) : links.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                  <ShoppingCart size={32} color="#3f424d" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, margin: '0 0 4px 0' }}>Nenhum link de carrinho criado ainda</p>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Vá em &quot;Criar Pedido&quot; e marque &quot;Gerar link de pagamento&quot;.</p>
                </td></tr>
              ) : links.map(link => {
                const status = getStatus(link)
                return (
                  <tr key={link.id} style={{ borderBottom: '1px solid #3f424d' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600,
                        background: `${status.color}18`, color: status.color, border: `1px solid ${status.color}30`,
                      }}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '0.85rem' }}>{link.customer_name || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{itemsCount(link.items)} produto{itemsCount(link.items) !== 1 ? 's' : ''}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>R$ {totalValue(link.items).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>{link.coupon_code || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(link.created_at).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => copyLink(link.id, link.token)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: copiedId === link.id ? '#10b98118' : '#3b82f618', color: copiedId === link.id ? '#10b981' : '#3b82f6',
                          border: `1px solid ${copiedId === link.id ? '#10b98130' : '#3b82f630'}`, cursor: 'pointer',
                        }}>
                          {copiedId === link.id ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                        </button>
                        <a href={getUrl(link.token)} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', padding: '5px 8px', borderRadius: '4px',
                          background: '#ffffff08', color: '#94a3b8', border: '1px solid #3f424d', cursor: 'pointer',
                        }}>
                          <ExternalLink size={12} />
                        </a>
                        <button onClick={() => deleteLink(link.id)} style={{
                          display: 'inline-flex', alignItems: 'center', padding: '5px 8px', borderRadius: '4px',
                          background: '#ef444410', color: '#ef4444', border: '1px solid #ef444425', cursor: 'pointer',
                        }}>
                          <Trash2 size={12} />
                        </button>
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
