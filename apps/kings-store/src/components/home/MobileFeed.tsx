'use client'
import React, { useState, useEffect } from 'react'
import { ProductCard } from '@kings/ui'
import Link from 'next/link'
import { useCart } from '../../contexts/CartContext'

const MOCK_PRODUCTS = [
  { id: '1', title: 'MOZA R5 Direct Drive Wheel Base', price: 3499.00, brand: 'MOZA RACING', imageUrl: 'https://mozaracing.com/wp-content/uploads/2022/08/R5-1-1.png', discount: 15, isNew: true },
  { id: '2', title: 'Fanatec CSL DD (8 Nm)', price: 4290.00, brand: 'FANATEC', imageUrl: 'https://fanatec.com/media/image/8f/b4/0c/CSL-DD-01_1280x1280.png' },
  { id: '3', title: 'Cockpit Xtreme Racing V8', price: 1899.00, brand: 'XTREME', imageUrl: 'https://xtremeracing.com.br/wp-content/uploads/2021/04/cockpit-v8-banco-concha-1.png' },
  { id: '4', title: 'Pedais Simagic P1000', price: 3200.00, brand: 'SIMAGIC', imageUrl: 'https://www.simagic.com/upload/202305/09/202305091605330349.png', discount: 5 }
]

const CATEGORIES = ['Tudo', 'Direct Drive', 'Pedais', 'Cockpits', 'Volantes', 'Acessórios']

export function MobileFeed() {
  const { addItem } = useCart()
  const [timeLeft, setTimeLeft] = useState('23:59:59')
  const [activeCat, setActiveCat] = useState('Tudo')

  // Mock Timer
  useEffect(() => {
    const i = setInterval(() => {
      const d = new Date()
      setTimeLeft(
        `${23 - d.getHours()}`.padStart(2,'0') + ':' +
        `${59 - d.getMinutes()}`.padStart(2,'0') + ':' +
        `${59 - d.getSeconds()}`.padStart(2,'0')
      )
    }, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Search Header */}
      <div style={{ padding: '20px 20px 10px', background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 className="font-display" style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>KINGSTORE</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
          </div>
        </div>
        
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '8px', border: '1px solid var(--border)' }}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Procurar 'Direct Drive'..." 
            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Horizontal Category Scroll */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', padding: '10px 20px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button 
            key={c}
            onClick={() => setActiveCat(c)}
            style={{ 
              whiteSpace: 'nowrap', 
              padding: '6px 16px', 
              background: activeCat === c ? 'var(--kings-primary)' : 'var(--bg-secondary)', 
              color: activeCat === c ? '#000' : 'var(--text-primary)', 
              border: activeCat === c ? 'none' : '1px solid var(--border)',
              borderRadius: '20px', 
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Flash Sale Banner */}
      <div style={{ padding: '0 20px', marginTop: '10px' }}>
        <div style={{ background: 'var(--gradient-primary)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ zIndex: 2, position: 'relative' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#000', background: 'rgba(255,255,255,0.9)', display: 'inline-flex', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px' }}>
              Flash Sale
            </div>
            <h2 className="font-display" style={{ margin: 0, color: '#fff', fontSize: '1.6rem', lineHeight: '1', fontWeight: 800 }}>Até 40% OFF<br/>Em Volantes</h2>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Acaba em:</span>
              <span style={{ background: 'rgba(0,0,0,0.5)', color: '#00e896', fontFamily: 'monospace', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>{timeLeft}</span>
            </div>
          </div>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.8, fontSize: '120px' }}>
            🏎️
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Destaques {activeCat !== 'Tudo' ? `- ${activeCat}` : ''}</h2>
          <Link href="/produtos" style={{ fontSize: '0.8rem', color: 'var(--kings-primary)' }}>Ver todos &rarr;</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} onClick={(e) => {
              // Hack to simulate clicking but keeping product flow
              // Or they add via a Quick Add button. Let's add Quick Add to product list!
            }}>
              <ProductCard {...product} />
              <button 
                onClick={(e) => { e.stopPropagation(); addItem({ ...product, quantity: 1 }) }}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '8px', marginTop: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                + Carrinho
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '40px' }} />
    </div>
  )
}
