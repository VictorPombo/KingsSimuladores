'use client'

import { useCart } from '@/contexts/CartContext'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@kings/ui'
import { formatPrice } from '@kings/utils'
import { CouponInput } from './CouponInput'
import { UpsellEngine } from '../upsell/UpsellEngine'
import { UpsellPopup } from '../upsell/UpsellPopup'
import { useState } from 'react'

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, subtotal, discount, totalPrice } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [showUpsellPopup, setShowUpsellPopup] = useState(false)

  const isSeven = pathname?.startsWith('/seven')
  const isMsu = pathname?.startsWith('/usado')
  
  let accentColor = 'var(--accent)'
  let checkoutBtnStyle: any = { width: '100%' }
  
  if (isSeven) {
    accentColor = '#ea580c'
    checkoutBtnStyle = { width: '100%', background: 'linear-gradient(135deg, #ea580c, #c2410c)', border: 'none', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)', color: '#fff' }
  } else if (isMsu) {
    accentColor = '#d946ef'
    checkoutBtnStyle = { width: '100%', background: 'linear-gradient(135deg, #d946ef, #a21caf)', border: 'none', boxShadow: '0 4px 15px rgba(217, 70, 239, 0.3)', color: '#fff' }
  }

  const handleCheckout = () => {
    if (items.length === 1 && !sessionStorage.getItem('kings_upsell_shown')) {
      setShowUpsellPopup(true)
    } else {
      setIsOpen(false)
      router.push('/checkout')
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999
        }}
      />
      <div 
        className="cart-drawer-container"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          animation: 'slideIn 0.3s ease-out forwards'
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>MEU CARRINHO</h2>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              Seu carrinho está vazio.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '16px' }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width: '80px', height: '80px', objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-sm)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.brand}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{item.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="font-display" style={{ fontWeight: 700 }}>{formatPrice(item.price)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '0.85rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Motor de Recomendação Inteligente */}
          {items.length > 0 && <UpsellEngine variant="compact" maxItems={2} />}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <CouponInput />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span className="font-display" style={{ fontWeight: 600 }}>{formatPrice(subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--green)' }}>
                  <span>Desconto:</span>
                  <span className="font-display" style={{ fontWeight: 600 }}>-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Frete:</span>
                <span style={{ fontStyle: 'italic' }}>Calculado no checkout</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Subtotal:</span>
                <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: accentColor }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <Button 
              size="lg" 
              style={checkoutBtnStyle}
              onClick={handleCheckout}
            >
              Finalizar Compra
            </Button>
            <Button variant="ghost" size="sm" style={{ width: '100%', marginTop: '8px' }} onClick={() => setIsOpen(false)}>
              Continuar Comprando
            </Button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 600px) {
          .cart-drawer-container {
            max-width: 100% !important;
          }
        }
      `}} />
      {showUpsellPopup && (
        <UpsellPopup
          onClose={() => setShowUpsellPopup(false)}
          onProceed={() => {
            setShowUpsellPopup(false)
            setIsOpen(false)
            router.push('/checkout')
          }}
        />
      )}
    </>
  )
}
