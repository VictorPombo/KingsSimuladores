'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'

const CONDITIONS = [
  { id: 'like_new', label: 'Como Novo' },
  { id: 'good', label: 'Bom' },
  { id: 'fair', label: 'Justo' },
]

export function MsuCatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const currentCondition = searchParams.get('condition')
  const activeCount = (currentCondition ? 1 : 0) + (searchParams.get('q') ? 1 : 0)

  const toggleCondition = useCallback(
    (value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (current.get('condition') === value) {
        current.delete('condition')
      } else {
        current.set('condition', value)
      }
      router.push(`/usado/produtos?${current.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (searchTerm.trim()) {
        current.set('q', searchTerm.trim())
      } else {
        current.delete('q')
      }
      router.push(`/usado/produtos?${current.toString()}`, { scroll: false })
    },
    [router, searchParams, searchTerm]
  )

  const clearAll = useCallback(() => {
    setSearchTerm('')
    router.push('/usado/produtos', { scroll: false })
  }, [router])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .msu-filter-bar {
          margin-bottom: 24px;
        }
        .msu-filter-chip {
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
        .msu-filter-chip:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
        }
        .msu-filter-chip.active {
          background: rgba(255, 107, 53, 0.12);
          border-color: rgba(255, 107, 53, 0.35);
          color: #FF6B35;
          font-weight: 600;
        }
        .msu-filter-panel {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.3s ease;
        }
        @media (max-width: 768px) {
          .msu-filter-sections {
            flex-direction: column !important;
            gap: 16px !important;
          }
        }
      `}} />

      <div className="msu-filter-bar">
        <div style={{
          background: 'rgba(15, 18, 30, 0.6)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          display: 'inline-block',
        }}>
          {/* Toggle Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            gap: '16px',
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
              <SlidersHorizontal size={16} color="#FF6B35" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Filtros
              </span>
              {activeCount > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #FF6B35, #FF3B5C)',
                  color: '#fff',
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
                Limpar
              </button>
            )}
          </div>

          {/* Expandable Panel */}
          <div
            className="msu-filter-panel"
            style={{
              maxHeight: isOpen ? '300px' : '0px',
              opacity: isOpen ? 1 : 0,
              padding: isOpen ? '0 20px 20px' : '0 20px 0',
              borderTop: isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            <div className="msu-filter-sections" style={{ display: 'flex', gap: '32px', paddingTop: '16px', alignItems: 'flex-end' }}>
              {/* Busca */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '10px',
                  textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700,
                }}>Buscar</h4>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Ex: Volante, Pedal..."
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                      padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <button type="submit" style={{
                    background: 'linear-gradient(135deg, #FF6B35, #FF3B5C)',
                    color: '#fff', border: 'none', padding: '8px 16px',
                    borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                    Buscar
                  </button>
                </form>
              </div>

              {/* Estado */}
              <div>
                <h4 style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '10px',
                  textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700,
                }}>Estado</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {CONDITIONS.map(cond => (
                    <button
                      key={cond.id}
                      className={`msu-filter-chip ${currentCondition === cond.id ? 'active' : ''}`}
                      onClick={() => toggleCondition(cond.id)}
                    >
                      {cond.label}
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
