'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const CATEGORIES = [
  { id: 'cockpits', label: 'Cockpits' },
  { id: 'volantes', label: 'Volantes' },
  { id: 'pedais', label: 'Pedais' },
  { id: 'acessorios', label: 'Acessórios' },
]

const BRANDS = [
  { id: 'xtreme', label: 'Xtreme Racing' },
  { id: 'fanatec', label: 'Fanatec' },
  { id: 'moza', label: 'Moza Racing' },
]

export function CatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleFilter = useCallback(
    (type: 'category' | 'brand', value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      const paramExists = current.get(type) === value
      
      // Quando clica, faz um toogle (se já estava marcado, remove. Se não, seleciona exclusivo)
      if (paramExists) {
        current.delete(type)
      } else {
        current.set(type, value)
      }

      router.push(`/produtos?${current.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const currentCategory = searchParams.get('category')
  const currentBrand = searchParams.get('brand')

  return (
    <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Filtros</h3>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Categorias</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CATEGORIES.map(cat => (
            <li key={cat.id}>
              <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  checked={currentCategory === cat.id}
                  onChange={() => toggleFilter('category', cat.id)}
                /> 
                {cat.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Marcas</h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {BRANDS.map(brand => (
            <li key={brand.id}>
              <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input 
                  type="checkbox" 
                  checked={currentBrand === brand.id}
                  onChange={() => toggleFilter('brand', brand.id)}
                /> 
                {brand.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
