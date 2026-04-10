'use client'

import React, { useState, useTransition } from 'react'
import { Ticket, Plus, Trash2, Power, PowerOff, Copy, CheckCircle, Tag, Truck, DollarSign, Clock, Users, Zap } from 'lucide-react'

type Coupon = {
  id: string; code: string; type: 'percent' | 'fixed' | 'shipping'
  value: number; brand_scope: string | null; is_active: boolean
  usage_count: number; usage_limit: number | null
  expires_at: string | null; created_at: string
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }

export function CuponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const coupons = initialCoupons

  const activeCount = coupons.filter(c => c.is_active).length
  const expiredCount = coupons.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length
  const totalUsage = coupons.reduce((acc, c) => acc + c.usage_count, 0)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getTypeIcon = (type: string) => {
    if (type === 'percent') return <Tag size={14} color="#f59e0b" />
    if (type === 'fixed') return <DollarSign size={14} color="#10b981" />
    return <Truck size={14} color="#a78bfa" />
  }

  const getTypeLabel = (type: string, value: number) => {
    if (type === 'percent') return `${value}% OFF`
    if (type === 'fixed') return `R$ ${value.toFixed(2)} OFF`
    return 'Frete Grátis'
  }

  const getTypeColor = (type: string) => {
    if (type === 'percent') return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' }
    if (type === 'fixed') return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' }
    return { bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.3)', text: '#a78bfa' }
  }

  const getScopeLabel = (scope: string | null) => {
    if (scope === 'kings') return { label: 'Kings', color: '#25d366' }
    if (scope === 'msu') return { label: 'MSU', color: '#06b6d4' }
    return { label: 'Todas', color: '#94a3b8' }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ticket size={24} color="#f59e0b" /> Cupons de Desconto
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Códigos promocionais que os clientes digitam no checkout</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: showForm ? '#ef444420' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: showForm ? '1px solid #ef444440' : 'none',
            borderRadius: '10px', padding: '12px 24px', 
            color: showForm ? '#ef4444' : '#000', fontWeight: 700, fontSize: '0.85rem', 
            cursor: 'pointer', boxShadow: showForm ? 'none' : '0 4px 16px rgba(245,158,11,0.3)',
            transition: 'all 0.3s'
          }}>
          <Plus size={16} style={{ transform: showForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s' }} /> 
          {showForm ? 'Cancelar' : 'Novo Cupom'}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Cupons Ativos', value: activeCount.toString(), color: '#10b981', icon: Zap },
          { label: 'Total de Usos', value: totalUsage.toString(), color: '#3b82f6', icon: Users },
          { label: 'Expirados', value: expiredCount.toString(), color: '#64748b', icon: Clock },
          { label: 'Total Cadastrados', value: coupons.length.toString(), color: '#f59e0b', icon: Ticket },
        ].map((k, i) => (
          <div key={i} style={{ 
            background: '#2c2e36', borderRadius: '12px', padding: '20px', 
            border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
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

      {/* Form */}
      {showForm && (
        <div style={{ 
          background: '#2c2e36', borderRadius: '12px', border: '1px solid #f59e0b30', 
          padding: '28px', marginBottom: '24px',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.05)'
        }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={18} color="#f59e0b" /> Criar novo cupom
          </h3>
          <form action="/admin/cupons" method="POST">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Código do Cupom *</label>
                <input name="code" type="text" required placeholder="BEMVINDO10" style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }} />
              </div>
              <div>
                <label style={labelStyle}>Tipo de Desconto *</label>
                <select name="type" style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                  <option value="shipping">Frete Grátis</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Valor *</label>
                <input name="value" type="number" step="0.01" required placeholder="10.00" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Abrangência</label>
                <select name="brand_scope" style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="all">Todas as Lojas (Kings + MSU)</option>
                  <option value="kings">Apenas Kings Simuladores</option>
                  <option value="msu">Apenas Meu Simulador Usado</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Validade (Opcional)</label>
                <input name="expires_at" type="date" style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
              <div>
                <label style={labelStyle}>Limite de Usos (Opcional)</label>
                <input name="usage_limit" type="number" placeholder="Ilimitado" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '10px',
                padding: '12px 32px', color: '#000', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                Criar Cupom
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr>
                {['Código', 'Desconto', 'Abrangência', 'Uso', 'Validade', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ 
                    padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, 
                    color: '#64748b', textTransform: 'uppercase', background: '#1f2025', letterSpacing: '0.5px'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Ticket size={36} color="#3f424d" />
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>Nenhum cupom cadastrado</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Clique em "Novo Cupom" para criar o primeiro código promocional.</p>
                  </div>
                </td></tr>
              ) : coupons.map(coupon => {
                const typeColor = getTypeColor(coupon.type)
                const scope = getScopeLabel(coupon.brand_scope)
                const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
                const usagePercent = coupon.usage_limit ? Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100) : 0

                return (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid #3f424d', opacity: isPending ? 0.5 : 1, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    
                    {/* Código */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px',
                          color: '#22d3ee', background: 'rgba(34, 211, 238, 0.08)', 
                          border: '1px solid rgba(34, 211, 238, 0.2)', padding: '6px 12px', borderRadius: '6px'
                        }}>
                          {coupon.code}
                        </span>
                        <button onClick={() => copyCode(coupon.code)} title="Copiar" style={{ 
                          background: 'none', border: 'none', cursor: 'pointer', color: copiedCode === coupon.code ? '#10b981' : '#64748b',
                          transition: 'color 0.2s', padding: '4px'
                        }}>
                          {copiedCode === coupon.code ? <CheckCircle size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* Desconto */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: typeColor.bg, border: `1px solid ${typeColor.border}`,
                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: typeColor.text
                      }}>
                        {getTypeIcon(coupon.type)} {getTypeLabel(coupon.type, coupon.value)}
                      </div>
                    </td>

                    {/* Abrangência */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 600, color: scope.color,
                        background: `${scope.color}15`, padding: '4px 10px', borderRadius: '6px'
                      }}>
                        {scope.label}
                      </span>
                    </td>

                    {/* Uso */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#1f2025', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: coupon.usage_limit ? `${usagePercent}%` : '0%', 
                            height: '100%', background: usagePercent > 80 ? '#ef4444' : '#22d3ee', 
                            borderRadius: '3px', transition: 'width 0.3s' 
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                          {coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Validade */}
                    <td style={{ padding: '16px 20px' }}>
                      {coupon.expires_at ? (
                        <span style={{ fontSize: '0.8rem', color: isExpired ? '#ef4444' : '#94a3b8', fontWeight: 500 }}>
                          {isExpired ? '⏰ Expirado' : new Date(coupon.expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Sem limite</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <form action={async () => { 'use server'; const { toggleCouponStatus } = await import('./actions'); await toggleCouponStatus(coupon.id, coupon.is_active) }}>
                        <button type="submit" style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: coupon.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                          border: `1px solid ${coupon.is_active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                          color: coupon.is_active ? '#10b981' : '#64748b',
                          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                          transition: 'all 0.2s'
                        }}>
                          {coupon.is_active ? <><Power size={12} /> Ativo</> : <><PowerOff size={12} /> Inativo</>}
                        </button>
                      </form>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '16px 20px' }}>
                      <form action={async () => { 'use server'; const { deleteCoupon } = await import('./actions'); await deleteCoupon(coupon.id) }}>
                        <button type="submit" title="Excluir permanentemente" style={{ 
                          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#ef4444', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
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
