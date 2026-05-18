'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Gamepad2, Settings, Armchair, Monitor, Tv, Footprints, Target, Package, Search, SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = [
  { id: 'acessorios', label: 'Acessórios', icon: Gamepad2 },
  { id: 'bases', label: 'Bases / DD', icon: Settings },
  { id: 'cockpits', label: 'Cockpits', icon: Armchair },
  { id: 'computadores', label: 'Computadores', icon: Monitor },
  { id: 'monitores', label: 'Monitores', icon: Tv },
  { id: 'pedais', label: 'Pedais', icon: Footprints },
  { id: 'volantes', label: 'Volantes', icon: Target },
  { id: 'outros', label: 'Outros', icon: Package },
]

const CONDITIONS = [
  { id: 'novo', label: 'Novo (Lacrado)' },
  { id: 'like_new', label: 'Seminovo' },
  { id: 'good', label: 'Bom' },
  { id: 'fair', label: 'Aceitável' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Mais Recentes' },
  { id: 'price_asc', label: 'Menor Preço' },
  { id: 'price_desc', label: 'Maior Preço' },
  { id: 'featured', label: 'Destaques' },
]

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export function MsuCatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  const currentCondition = searchParams.get('condition')
  const currentCategory = searchParams.get('category')
  const currentState = searchParams.get('state')
  const currentSort = searchParams.get('sort') || 'newest'
  const currentHasBox = searchParams.get('hasBox')
  const currentBrand = searchParams.get('brand')
  const currentCity = searchParams.get('city')

  const activeCount = [
    searchParams.get('q'),
    currentCondition,
    currentCategory,
    currentState,
    currentCity,
    currentBrand,
    currentHasBox,
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
  ].filter(Boolean).length

  const applyFilter = useCallback((key: string, value: string | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    if (value === null || current.get(key) === value) {
      current.delete(key)
    } else {
      current.set(key, value)
    }
    router.push(`/usado/produtos?${current.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    applyFilter('q', searchTerm.trim() || null)
  }, [applyFilter, searchTerm])

  const clearAll = useCallback(() => {
    setSearchTerm('')
    router.push('/usado/produtos', { scroll: false })
  }, [router])

  const chipBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(15,18,30,0.7)', color: '#a1a1aa', whiteSpace: 'nowrap' as const,
    backdropFilter: 'blur(12px)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  }

  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: 'var(--accent-dim)', borderColor: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 600,
    boxShadow: '0 4px 12px var(--accent-glow)'
  }

  const selectStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none',
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{
        display: 'flex', gap: '8px', marginBottom: '16px',
        background: 'rgba(15,18,30,0.6)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '8px', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
          <input
            type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por marca, modelo ou descrição..."
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '10px 12px 10px 36px', fontSize: '0.95rem', outline: 'none' }}
          />
        </div>
        <button type="submit" style={{
          background: 'var(--accent)', color: '#000', border: 'none', padding: '10px 24px',
          borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
        }}>Buscar</button>
      </form>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button key={cat.id} onClick={() => applyFilter('category', cat.id)}
              style={currentCategory === cat.id ? chipActive : chipBase}>
              <Icon size={16} strokeWidth={2.5} /> {cat.label}
            </button>
          )
        })}
      </div>

      {/* Collapsible Advanced Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isOpen ? '12px' : '0' }}>
        <button onClick={() => setIsOpen(p => !p)} style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#71717a', fontSize: '0.8rem', fontWeight: 600, padding: 0,
        }}>
          <SlidersHorizontal size={14} /> Filtros Avançados
          {activeCount > 0 && (
            <span style={{ background: 'var(--accent)', color: '#000', fontSize: '0.6rem', fontWeight: 800, width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#52525b', fontSize: '0.75rem' }}>
            <X size={12} /> Limpar tudo
          </button>
        )}
      </div>

      {isOpen && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: '24px',
          background: 'linear-gradient(145deg, rgba(15,20,35,0.6) 0%, rgba(8,12,24,0.8) 100%)', 
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          marginTop: '16px'
        }}>
          {/* Estilos reutilizáveis para Premium Look */}
          {(() => {
            const premiumLabel: React.CSSProperties = {
              display: 'block', fontSize: '0.7rem', color: '#a1a1aa', textTransform: 'uppercase', 
              letterSpacing: '1px', marginBottom: '8px', fontWeight: 700
            };
            const premiumInput: React.CSSProperties = {
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', 
              outline: 'none', transition: 'all 0.2s', width: '100%',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            };

            return (
              <>
                <div>
                  <label style={premiumLabel}>Estado</label>
                  <select value={currentState || ''} onChange={e => applyFilter('state', e.target.value || null)} style={premiumInput}>
                    <option value="">Todos os Estados</option>
                    {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>

                <div>
                  <label style={premiumLabel}>Cidade</label>
                  <input type="text" placeholder="Ex: São Paulo" defaultValue={currentCity || ''} onBlur={e => applyFilter('city', e.target.value || null)}
                    style={premiumInput} />
                </div>

                <div>
                  <label style={premiumLabel}>Marca</label>
                  <input type="text" placeholder="Ex: Fanatec" defaultValue={currentBrand || ''} onBlur={e => applyFilter('brand', e.target.value || null)}
                    style={premiumInput} />
                </div>

                <div>
                  <label style={premiumLabel}>Condição</label>
                  <select value={currentCondition || ''} onChange={e => applyFilter('condition', e.target.value || null)} style={premiumInput}>
                    <option value="">Qualquer Estado</option>
                    {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={premiumLabel}>Caixa Original</label>
                  <select value={currentHasBox || ''} onChange={e => applyFilter('hasBox', e.target.value || null)} style={premiumInput}>
                    <option value="">Tanto faz</option>
                    <option value="true">Sim, possui</option>
                    <option value="false">Não possui</option>
                  </select>
                </div>

                <div>
                  <label style={premiumLabel}>Preço Mínimo</label>
                  <input type="number" placeholder="R$ 0" defaultValue={searchParams.get('minPrice') || ''} onBlur={e => applyFilter('minPrice', e.target.value || null)}
                    style={premiumInput} />
                </div>

                <div>
                  <label style={premiumLabel}>Preço Máximo</label>
                  <input type="number" placeholder="Sem limite" defaultValue={searchParams.get('maxPrice') || ''} onBlur={e => applyFilter('maxPrice', e.target.value || null)}
                    style={premiumInput} />
                </div>

                <div>
                  <label style={premiumLabel}>Ordenar Por</label>
                  <select value={currentSort} onChange={e => applyFilter('sort', e.target.value)} style={premiumInput}>
                    {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
