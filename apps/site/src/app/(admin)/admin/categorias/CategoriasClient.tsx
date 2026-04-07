'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Folder, Edit2, Trash2, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'

type Category = { id: string; name: string; slug: string; brand_scope: string | null; sort_order: number; parent_id: string | null }

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none' }

export function CategoriasClient({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [brandScope, setBrandScope] = useState<string>('')

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Categorias</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>{categories.length} categorias cadastradas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '8px',
          padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(139,92,246,0.3)'
        }}><Plus size={16} /> Nova Categoria</button>
      </div>

      {showForm && (
        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Criar nova categoria</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Nome *</label><input type="text" value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} placeholder="Ex: Cockpits" style={inputStyle} /></div>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Slug</label><input type="text" value={slug} onChange={e => setSlug(e.target.value)} style={{ ...inputStyle, color: '#64748b' }} /></div>
            <div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Escopo de Marca</label>
              <select value={brandScope} onChange={e => setBrandScope(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Ambas as marcas</option>
                <option value="kings">Kings</option>
                <option value="msu">MSU</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Categoria', 'Slug', 'Escopo', 'Ordem'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  <Folder size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                  Nenhuma categoria cadastrada.
                </td></tr>
              ) : categories.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #3f424d', transition: 'background 0.15s' }}
                  onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Folder size={16} color="#8b5cf6" />
                      <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 500 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{c.slug}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                      background: !c.brand_scope ? '#94a3b815' : c.brand_scope === 'kings' ? '#3b82f615' : '#f59e0b15',
                      color: !c.brand_scope ? '#94a3b8' : c.brand_scope === 'kings' ? '#3b82f6' : '#f59e0b'
                    }}>{!c.brand_scope ? 'Ambas' : c.brand_scope === 'kings' ? 'Kings' : 'MSU'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{c.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
