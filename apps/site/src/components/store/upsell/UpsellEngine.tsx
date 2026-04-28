'use client'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@kings/utils'

/**
 * Motor de Recomendação Inteligente — Kings Simuladores
 * 
 * Regras de Cross-sell baseadas em categorias complementares:
 * - Volante → Cockpit, Pedais
 * - Cockpit → Volante, Pedais, Câmbio
 * - Pedais → Volante, Câmbio
 * - Câmbio → Cockpit, Pedais
 * - Base/DD → Volante ARO, Cockpit
 * 
 * Em produção, isso pode ser substituído por queries do Supabase
 * com base em orders_items que frequentemente aparecem juntos.
 */

// Catálogo de sugestões (mock) — será trocado por consulta real ao banco
const SUGGESTION_CATALOG = [
  { id: 'up-1', title: 'Cockpit SXT V2', price: 2199.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Cockpit', brand: 'XTREME RACING', category: 'cockpit' },
  { id: 'up-2', title: 'Volante Fanatec DD Pro', price: 7999.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Volante', brand: 'FANATEC', category: 'volante' },
  { id: 'up-3', title: 'Pedais Load Cell V3', price: 3499.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Pedais', brand: 'FANATEC', category: 'pedais' },
  { id: 'up-4', title: 'Câmbio H-Shifter TH8A', price: 1899.90, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Cambio', brand: 'THRUSTMASTER', category: 'cambio' },
  { id: 'up-5', title: 'Suporte de Monitor Triplo', price: 899.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Suporte', brand: 'XTREME RACING', category: 'acessorio' },
  { id: 'up-6', title: 'Base Moza R9 Direct Drive', price: 5499.00, imageUrl: 'https://placehold.co/200x200/131928/e8ecf4?text=Base+DD', brand: 'MOZA RACING', category: 'base' },
]

// Grafo de complementaridade: se tem X no carrinho, sugere Y
const CROSS_SELL_RULES: Record<string, string[]> = {
  volante: ['cockpit', 'pedais', 'acessorio'],
  cockpit: ['volante', 'pedais', 'cambio'],
  pedais: ['volante', 'cambio', 'cockpit'],
  cambio: ['cockpit', 'pedais', 'acessorio'],
  base: ['cockpit', 'pedais', 'cambio'],
  acessorio: ['cockpit', 'volante'],
}

function detectCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('cockpit') || t.includes('suporte')) return 'cockpit'
  if (t.includes('volante') || t.includes('aro')) return 'volante'
  if (t.includes('pedal') || t.includes('load cell')) return 'pedais'
  if (t.includes('câmbio') || t.includes('shifter')) return 'cambio'
  if (t.includes('base') || t.includes('direct drive') || t.includes('dd')) return 'base'
  return 'acessorio'
}

interface UpsellEngineProps {
  /** Formato compacto para o CartDrawer, expandido para o Checkout */
  variant?: 'compact' | 'full'
  /** Limite de sugestões */
  maxItems?: number
}

export function UpsellEngine({ variant = 'compact', maxItems = 2 }: UpsellEngineProps) {
  const { items, addItem, setIsOpen } = useCart()

  if (items.length === 0) return null

  // 1. Detectar categorias no carrinho
  const cartCategories = items.map(item => detectCategory(item.title))
  const cartIds = new Set(items.map(i => i.id))

  // 2. Calcular quais categorias devemos sugerir
  const suggestedCategories = new Set<string>()
  cartCategories.forEach(cat => {
    const rules = CROSS_SELL_RULES[cat] || []
    rules.forEach(r => {
      if (!cartCategories.includes(r)) suggestedCategories.add(r)
    })
  })

  // 3. Filtrar catálogo: não sugerir o que já está no carrinho
  const suggestions = SUGGESTION_CATALOG
    .filter(p => suggestedCategories.has(p.category) && !cartIds.has(p.id))
    .slice(0, maxItems)

  if (suggestions.length === 0) return null

  const handleAdd = (product: typeof SUGGESTION_CATALOG[0]) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      quantity: 1,
    })
  }

  // ── VERSÃO COMPACTA (CartDrawer) ──
  if (variant === 'compact') {
    return (
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'rgba(0,229,255,0.03)',
        border: '1px solid rgba(0,229,255,0.1)',
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'var(--accent)',
          fontWeight: 700,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ⚡ Complete seu Setup
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {suggestions.map(product => (
            <div
              key={product.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: 'var(--bg-card)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s, transform 0.15s',
                cursor: 'pointer',
              }}
              onClick={() => handleAdd(product)}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'contain', background: '#fff' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {product.brand}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="font-display" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {formatPrice(product.price)}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--green)', fontWeight: 600 }}>
                  + ADICIONAR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── VERSÃO FULL (Checkout Page) ──
  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'rgba(0,229,255,0.02)',
      border: '1px solid rgba(0,229,255,0.08)',
      borderRadius: '12px',
    }}>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: 700,
        color: 'var(--accent, #00e5ff)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        ⚡ Pilotos que compraram isso também levaram
      </div>

      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        paddingBottom: '8px',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          .upsell-scroll::-webkit-scrollbar { height: 4px; }
          .upsell-scroll::-webkit-scrollbar-track { background: transparent; }
          .upsell-scroll::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.2); border-radius: 2px; }
        `}} />
        {suggestions.map(product => (
          <div
            key={product.id}
            style={{
              minWidth: '180px',
              maxWidth: '220px',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              background: 'rgba(10,14,26,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              padding: '16px',
              textAlign: 'center',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => handleAdd(product)}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#00e5ff'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'contain', background: '#fff', margin: '0 auto 12px' }}
            />
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {product.brand}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
              {product.title}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#00e5ff', marginBottom: '8px' }}>
              {formatPrice(product.price)}
            </div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#06d6a0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '6px 12px',
              border: '1px solid rgba(6,214,160,0.3)',
              borderRadius: '6px',
              display: 'inline-block',
            }}>
              + Adicionar ao Carrinho
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
