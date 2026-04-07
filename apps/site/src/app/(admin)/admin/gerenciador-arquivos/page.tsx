'use client'

import React, { useState } from 'react'
import { Upload, FolderOpen, Image, FileText, File, Trash2 } from 'lucide-react'

export default function GerenciadorArquivosPage() {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Gerenciador de Arquivos</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Upload e gerenciamento de mídias da loja (Supabase Storage)</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false) }}
        style={{
          background: dragOver ? '#8b5cf610' : '#2c2e36', borderRadius: '12px',
          border: `2px dashed ${dragOver ? '#8b5cf6' : '#3f424d'}`,
          padding: '40px', textAlign: 'center', marginBottom: '24px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}>
        <Upload size={32} color={dragOver ? '#8b5cf6' : '#3f424d'} style={{ margin: '0 auto 12px', display: 'block' }} />
        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 6px' }}>Arraste arquivos aqui ou clique para selecionar</p>
        <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0 }}>Imagens (JPG, PNG, WebP), PDFs e documentos — até 10MB</p>
      </div>

      {/* Buckets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { name: 'product-images', count: 85, icon: Image, color: '#3b82f6', size: '~120 MB' },
          { name: 'marketplace-listings', count: 0, icon: Image, color: '#f59e0b', size: '0 MB' },
          { name: 'invoices', count: 0, icon: FileText, color: '#10b981', size: '0 MB' },
          { name: 'documents', count: 0, icon: File, color: '#8b5cf6', size: '0 MB' },
        ].map(b => (
          <div key={b.name} style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><b.icon size={20} color={b.color} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>{b.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>{b.count} arquivos · {b.size}</div>
            </div>
            <FolderOpen size={16} color="#64748b" style={{ cursor: 'pointer' }} />
          </div>
        ))}
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #3f424d', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>Arquivos recentes</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Arquivo', 'Bucket', 'Tamanho', 'Data'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <FolderOpen size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              Uploads aparecerão aqui.
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
