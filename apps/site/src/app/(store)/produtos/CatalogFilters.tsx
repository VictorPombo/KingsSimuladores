'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'

const BRANDS = [
  { id: 'xtreme', label: 'Xtreme Racing' },
  { id: 'fanatec', label: 'Fanatec' },
  { id: 'moza', label: 'Moza Racing' },
]

export function CatalogFilters({ categories = [] }: { categories?: Array<{id: string, name: string, slug: string}> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const toggleFilter = useCallback(
    (type: 'category' | 'brand', value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      const paramExists = current.get(type) === value
      
      if (paramExists) {
        current.delete(type)
      } else {
        current.set(type, value)
      }

      router.push(`/produtos?${current.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearAll = useCallback(() => {
    router.push('/produtos', { scroll: false })
  }, [router])

  const currentCategory = searchParams.get('category')
  const currentBrand = searchParams.get('brand')
  const activeCount = (currentCategory ? 1 : 0) + (currentBrand ? 1 : 0)

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .kings-filter-bar {
          margin-bottom: 24px;
        }
        .kings-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .kings-filter-chip:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
        }
        .kings-filter-chip.active {
          background: rgba(0, 229, 255, 0.1);
          border-color: rgba(0, 229, 255, 0.3);
          color: var(--accent);
          font-weight: 600;
        }
        .kings-filter-panel {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.3s ease;
        }
        @media (max-width: 768px) {
          .kings-filter-sections {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .kings-filter-chips-row {
            flex-wrap: wrap !important;
          }
        }
      `}} />

      <div className="kings-filter-bar">
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'inline-block',
        }}>
          {/* Toggle Button Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
          }}>
            <button
              onClick={() => setIsOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                padding: 0,
              }}
            >
              <SlidersHorizontal size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Filtros
              </span>
              {activeCount > 0 && (
                <span style={{
                  background: 'var(--accent)',
                  color: '#000',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {activeCount}
                </span>
              )}
              <ChevronDown size={14} color="var(--text-muted)" style={{
                transition: 'transform 0.3s ease',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }} />
            </button>

            {activeCount > 0 && (
              <button
                onClick={clearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'color 0.2s',
                }}
              >
                <X size={12} />
                Limpar filtros
              </button>
            )}
          </div>

          {/* Expandable Panel */}
          <div
            className="kings-filter-panel"
            style={{
              maxHeight: isOpen ? '300px' : '0px',
              opacity: isOpen ? 1 : 0,
              padding: isOpen ? '0 20px 20px' : '0 20px 0',
              borderTop: isOpen ? '1px solid var(--border)' : 'none',
            }}
          >
            <div className="kings-filter-sections" style={{ display: 'flex', gap: '40px', paddingTop: '16px' }}>
              {/* Categorias */}
              <div>
                <h4 style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontWeight: 700,
                }}>Categorias</h4>
                <div className="kings-filter-chips-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`kings-filter-chip ${currentCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => toggleFilter('category', cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              <div>
                <h4 style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontWeight: 700,
                }}>Marcas</h4>
                <div className="kings-filter-chips-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {BRANDS.map(brand => (
                    <button
                      key={brand.id}
                      className={`kings-filter-chip ${currentBrand === brand.id ? 'active' : ''}`}
                      onClick={() => toggleFilter('brand', brand.id)}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
