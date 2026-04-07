'use client'

import React, { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { validateCouponCode } from '@/app/actions/coupon'

export function CouponInput() {
  const { coupon, applyCoupon, items } = useCart()
  const [code, setCode] = useState(coupon ? coupon.code : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // O carrinho agrupa itens de uma marca específica ou misto. Vamos assumir a marca predominante ou ignorar.
  const cartBrand = items.length > 0 ? items[0].brand : undefined

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!code) return

    setLoading(true)
    const result = await validateCouponCode(code, cartBrand as 'kings' | 'msu' | undefined)
    setLoading(false)

    if (result.success && result.coupon) {
      applyCoupon({
        id: result.coupon.id,
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value
      })
    } else {
      setError(result.error || 'Erro ao validar cupom')
      applyCoupon(null)
    }
  }

  function handleRemove() {
    setCode('')
    setError(null)
    applyCoupon(null)
  }

  if (coupon) {
    return (
      <div style={{ marginTop: '16px', background: 'rgba(6, 214, 160, 0.1)', border: '1px solid rgba(6, 214, 160, 0.2)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--green)', fontWeight: 700 }}>Cupom Aplicado</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{coupon.code}</div>
        </div>
        <button 
          onClick={handleRemove} 
          disabled={loading}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Remover
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleApply} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="CUPOM DE DESCONTO" 
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          disabled={loading}
          style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}
        />
        <button 
          type="submit" 
          disabled={loading || !code}
          style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: (loading || !code) ? 'not-allowed' : 'pointer', opacity: (loading || !code) ? 0.5 : 1 }}
        >
          {loading ? '...' : 'Aplicar'}
        </button>
      </div>
      {error && <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{error}</span>}
    </form>
  )
}
