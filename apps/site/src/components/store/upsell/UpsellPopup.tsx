'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@kings/utils'
import { X, Zap, Truck } from 'lucide-react'

/**
 * Popup de Upsell que aparece quando o carrinho tem exatamente 1 item
 * e o usuário clica em "Finalizar Compra".
 * 
 * Aparece apenas 1 vez por sessão (sessionStorage).
 */

// Mesmas regras do UpsellEngine
const CROSS_SELL_RULES: Record<string, string[]> = {
  volante: ['cockpit', 'pedais'],
  cockpit: ['volante', 'pedais'],
  pedais: ['volante', 'cambio'],
  cambio: ['cockpit', 'pedais'],
  base: ['volante', 'cockpit'],
  acessorio: ['cockpit', 'volante'],
}

const SUGGESTION_CATALOG = [
  { id: 'up-1', title: 'Cockpit SXT V2', price: 2199.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Cockpit', brand: 'XTREME RACING', category: 'cockpit' },
  { id: 'up-2', title: 'Volante Fanatec DD Pro', price: 7999.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Volante', brand: 'FANATEC', category: 'volante' },
  { id: 'up-3', title: 'Pedais Load Cell V3', price: 3499.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Pedais', brand: 'FANATEC', category: 'pedais' },
  { id: 'up-4', title: 'Câmbio H-Shifter TH8A', price: 1899.90, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Cambio', brand: 'THRUSTMASTER', category: 'cambio' },
  { id: 'up-6', title: 'Base Moza R9 Direct Drive', price: 5499.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Base+DD', brand: 'MOZA RACING', category: 'base' },
]

const UPSELL_DISCOUNT = 100 // R$ de desconto no combo

function detectCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('cockpit') || t.includes('suporte')) return 'cockpit'
  if (t.includes('volante') || t.includes('aro')) return 'volante'
  if (t.includes('pedal') || t.includes('load cell')) return 'pedais'
  if (t.includes('câmbio') || t.includes('shifter')) return 'cambio'
  if (t.includes('base') || t.includes('direct drive') || t.includes('dd')) return 'base'
  return 'acessorio'
}

interface UpsellPopupProps {
  onClose: () => void
  onProceed: () => void
}

export function UpsellPopup({ onClose, onProceed }: UpsellPopupProps) {
  const { items, addItem } = useCart()
  const [visible, setVisible] = useState(true)

  // Find a suggestion
  const cartCategory = items.length === 1 ? detectCategory(items[0].title) : null
  const complementCategories = cartCategory ? (CROSS_SELL_RULES[cartCategory] || []) : []
  const cartIds = new Set(items.map(i => i.id))
  const suggestion = SUGGESTION_CATALOG.find(
    p => complementCategories.includes(p.category) && !cartIds.has(p.id)
  )

  // No suggestion or already shown this session? Skip
  useEffect(() => {
    if (sessionStorage.getItem('kings_upsell_shown')) {
      setVisible(false)
      onProceed()
    } else {
      sessionStorage.setItem('kings_upsell_shown', '1')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // If no suggestion found, proceed immediately
  useEffect(() => {
    if (!suggestion && visible) {
      onProceed()
    }
  }, [suggestion, visible]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible || !suggestion) {
    return null
  }

  const handleAdd = () => {
    addItem({
      id: suggestion.id,
      title: suggestion.title,
      price: suggestion.price - UPSELL_DISCOUNT,
      imageUrl: suggestion.imageUrl,
      brand: suggestion.brand,
      quantity: 1,
    })
    onProceed()
  }

  const handleSkip = () => {
    onProceed()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}} />

      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'linear-gradient(180deg, rgba(15,20,35,0.98) 0%, rgba(8,12,24,0.99) 100%)',
        border: '1px solid rgba(0,229,255,0.15)',
        borderRadius: '1.5rem', overflow: 'hidden',
        animation: 'popIn 0.4s ease',
        boxShadow: '0 0 60px rgba(0,229,255,0.08), 0 25px 80px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          <button onClick={handleSkip} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#71717a' }}>
            <X size={16} />
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,229,255,0.1)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
            <Zap size={14} /> Oferta Exclusiva
          </div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            Complete seu Setup!
          </h2>
          <p style={{ margin: '8px 0 0', color: '#71717a', fontSize: '0.9rem' }}>
            Adicione o complemento perfeito e economize
          </p>
        </div>

        {/* Product */}
        <div style={{ padding: '1.5rem', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img src={suggestion.imageUrl} alt={suggestion.title} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'contain', background: '#fff', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>{suggestion.brand}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{suggestion.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: '#52525b', textDecoration: 'line-through' }}>{formatPrice(suggestion.price)}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#06d6a0' }}>{formatPrice(suggestion.price - UPSELL_DISCOUNT)}</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(6, 214, 160, 0.06)', border: '1px solid rgba(6, 214, 160, 0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#06d6a0' }}>-{formatPrice(UPSELL_DISCOUNT)}</div>
            <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>Desconto no combo</div>
          </div>
          <div style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.15)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={18} color="#00e5ff" />
            <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>Frete reduzido (1 envio)</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleAdd} style={{
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #06d6a0, #00e5ff)', color: '#000',
            fontSize: '1rem', fontWeight: 800, cursor: 'pointer', transition: 'transform 0.2s',
          }}>
            ✓ Adicionar e Aproveitar
          </button>
          <button onClick={handleSkip} style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            color: '#71717a', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
          }}>
            Não, obrigado — ir para checkout
          </button>
        </div>
      </div>
    </div>
  )
}
