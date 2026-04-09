'use client'

import React, { useState } from 'react'
import { Plus, Folder, Loader2, Save, X, Settings2, ShieldAlert } from 'lucide-react'

type Category = { id: string; name: string; slug: string; brand_scope: string | null; sort_order: number; parent_id: string | null }

const inputStyle: React.CSSProperties = { 
  width: '100%', background: '#1c1d22', border: '1px solid #3f424d', 
  borderRadius: '8px', padding: '12px 14px', color: '#f8fafc', 
  fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' 
}

export function CategoriasClient({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [brandScope, setBrandScope] = useState<string>('')

  const handleSave = () => {
    setIsPending(true)
    // Server action wireup would go here. For now we simulate save config.
    setTimeout(() => {
      setIsPending(false)
      setShowForm(false)
      setName('')
      setSlug('')
    }, 800)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Premium */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#24252b', padding: '24px', borderRadius: '16px', border: '1px solid #3f424d80' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#8b5cf620', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #8b5cf650' }}>
            <Folder size={24} color="#8b5cf6" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.5px' }}>Categorias</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '2px', margin: 0 }}>Organize o catálogo e os filtros da loja</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          disabled={showForm}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: showForm ? '#3f424d' : '#8b5cf6', border: 'none', borderRadius: '10px',
            padding: '12px 24px', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: showForm ? 'default' : 'pointer',
            transition: 'transform 0.2s, background 0.2s',
            boxShadow: showForm ? 'none' : '0 4px 12px rgba(139,92,246,0.3)'
          }}>
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      {/* Editor / Form (Expansível) */}
      {showForm && (
        <div style={{ background: '#24252b', borderRadius: '16px', border: '1px solid #8b5cf680', padding: '24px', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Settings2 size={18} color="#8b5cf6" />
            <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Configurar Categoria</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Nome da Categoria *</label>
              <input 
                type="text" value={name} 
                onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} 
                placeholder="Ex: Cockpits F1" 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Slug (URL)</label>
              <input 
                type="text" value={slug} 
                onChange={e => setSlug(e.target.value)} 
                style={{ ...inputStyle, color: '#64748b' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Escopo de Marca</label>
              <select value={brandScope} onChange={e => setBrandScope(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">🛒 Ambas (Global)</option>
                <option value="kings">⚪️ Kings Simuladores</option>
                <option value="msu">🟠 Meu Simulador Usado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #3f424d80' }}>
            <button 
              onClick={() => setShowForm(false)}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <X size={16} /> Cancelar
            </button>
            <button 
              onClick={handleSave} disabled={isPending || !name}
              style={{ padding: '10px 24px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: isPending || !name ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isPending || !name ? 0.6 : 1 }}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Categoria
            </button>
          </div>
        </div>
      )}

      {/* Lista Premium via Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Cabeçalho da Lista */}
        {categories.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 80px', gap: '16px', padding: '0 20px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <div>Nome da Categoria</div>
            <div>URL Slug</div>
            <div>Escopo de Exibição</div>
            <div style={{ textAlign: 'right' }}>Ordem</div>
          </div>
        )}

        {/* Itens */}
        {categories.length === 0 ? (
          <div style={{ background: '#24252b', borderRadius: '16px', border: '1px dashed #3f424d', padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#1c1d22', padding: '20px', borderRadius: '50%', marginBottom: '16px' }}>
              <ShieldAlert size={32} color="#64748b" />
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', margin: '0 0 8px 0' }}>Sua árvore de categorias está vazia</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: '400px' }}>Categorias organizam os produtos e permitem criar menus dinâmicos no site. Comece criando a primeira agora!</p>
          </div>
        ) : (
          categories.map(c => (
            <div key={c.id} style={{ 
              display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr 80px', gap: '16px', alignItems: 'center',
              background: '#24252b', padding: '16px 20px', borderRadius: '12px', border: '1px solid #3f424d80',
              transition: 'transform 0.2s, border-color 0.2s', cursor: 'default'
            }}
            onMouseEnter={(e: any) => e.currentTarget.style.borderColor = '#8b5cf680'}
            onMouseLeave={(e: any) => e.currentTarget.style.borderColor = '#3f424d80'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: '#1c1d22', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #3f424d50' }}>
                  <Folder size={16} color="#8b5cf6" />
                </div>
                <span style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>{c.name}</span>
              </div>
              
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8', background: '#1c1d22', padding: '4px 8px', borderRadius: '6px', display: 'inline-flex', width: 'fit-content' }}>
                /{c.slug}
              </div>
              
              <div>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                  background: !c.brand_scope ? '#64748b20' : c.brand_scope === 'kings' ? '#3b82f620' : '#f59e0b20',
                  color: !c.brand_scope ? '#cbd5e1' : c.brand_scope === 'kings' ? '#60a5fa' : '#fbbf24',
                  border: `1px solid ${!c.brand_scope ? '#64748b40' : c.brand_scope === 'kings' ? '#3b82f640' : '#f59e0b40'}`
                }}>
                  {!c.brand_scope ? 'Global' : c.brand_scope === 'kings' ? 'Kings' : 'MSU'}
                </span>
              </div>
              
              <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                {c.sort_order}
              </div>
            </div>
          ))
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

