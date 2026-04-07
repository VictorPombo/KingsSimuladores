'use client'

import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { Button } from '@kings/ui'
import { formatPrice } from '@kings/utils'

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, totalPrice } = useCart()
  const router = useRouter()

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
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: '400px',
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
        </div>

        {items.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatPrice(totalPrice)}</span>
            </div>
            <Button 
              size="lg" 
              style={{ width: '100%' }}
              onClick={() => {
                setIsOpen(false)
                router.push('/checkout')
              }}
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
      `}} />
    </>
  )
}
