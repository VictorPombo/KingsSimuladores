'use client'

import React from 'react'
import { Paintbrush, Info, Layout } from 'lucide-react'

export default function EditorVisualPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Editor Visual</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Edite o layout da loja visualmente</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#8b5cf620', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Paintbrush size={32} color="#8b5cf6" />
        </div>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 12px 0' }}>Editor Visual em desenvolvimento</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          O editor visual drag-and-drop permitirá customizar banners, seções, cores e tipografia da loja sem precisar de código. Ideal para campanhas sazonais e personalização rápida.
        </p>
        <div style={{ marginTop: '24px', padding: '12px 20px', background: '#8b5cf618', border: '1px solid #8b5cf630', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#8b5cf6' }}>
          <Info size={14} /> Previsão: próxima atualização
        </div>
      </div>
    </div>
  )
}
