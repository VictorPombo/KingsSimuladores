'use client'

import React from 'react'
import { Palette, Layout, Eye, Sparkles } from 'lucide-react'

export default function TemasPage() {
  const themes = [
    { name: 'Kings Dark Premium', active: true, desc: 'Tema oficial dark mode com gradientes neon', preview: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)' },
    { name: 'Kings Light', active: false, desc: 'Variante light para visualização diurna', preview: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' },
    { name: 'MSU Racing', active: false, desc: 'Tema exclusivo marketplace com acentos laranja', preview: 'linear-gradient(135deg, #1a1a2e, #0f0f23, #2d1b4e)' },
  ]

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Temas</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Personalize a aparência da sua loja</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {themes.map(t => (
          <div key={t.name} style={{ background: '#2c2e36', borderRadius: '12px', border: t.active ? '2px solid #8b5cf6' : '1px solid #3f424d', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ height: '120px', background: t.preview, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layout size={32} color={t.active ? '#8b5cf6' : '#64748b'} />
              {t.active && <div style={{ position: 'absolute', top: '12px', right: '12px', padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold', background: '#8b5cf6', color: '#fff' }}>ATIVO</div>}
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{t.name}</div>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 12px' }}>{t.desc}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #3f424d', background: 'transparent', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Eye size={14} /> Preview</button>
                {!t.active && <button style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Ativar</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
