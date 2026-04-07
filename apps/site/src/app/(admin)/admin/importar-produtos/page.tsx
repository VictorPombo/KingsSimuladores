'use client'

import { Upload, FileUp, AlertTriangle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import React, { useState } from 'react'

export default function ImportarProdutosPage() {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Importar Produtos</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Importe produtos em massa via arquivo CSV</p>
      </div>

      {/* Drag and Drop */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false) }}
        style={{
          background: dragOver ? '#8b5cf610' : '#2c2e36', borderRadius: '12px',
          border: `2px dashed ${dragOver ? '#8b5cf6' : '#3f424d'}`,
          padding: '60px 40px', textAlign: 'center', marginBottom: '24px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
      >
        <Upload size={40} color={dragOver ? '#8b5cf6' : '#3f424d'} style={{ margin: '0 auto 16px', display: 'block' }} />
        <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 600, margin: '0 0 8px 0' }}>
          Arraste um arquivo CSV aqui ou clique para selecionar
        </p>
        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
          Formato aceito: .csv (até 5MB) — Use ponto e vírgula como separador
        </p>
        <input type="file" accept=".csv" style={{ display: 'none' }} />
      </div>

      {/* Instructions */}
      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSpreadsheet size={18} color="#8b5cf6" /> Formato do CSV
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Seu arquivo CSV deve conter as seguintes colunas (na ordem):</p>
        <div style={{ background: '#1f2025', borderRadius: '6px', padding: '16px', overflow: 'auto' }}>
          <code style={{ color: '#10b981', fontSize: '0.8rem', whiteSpace: 'pre' }}>
            titulo;slug;descricao;preco;preco_comparativo;estoque;sku;marca;categoria;status;peso_kg
          </code>
        </div>
        <div style={{ marginTop: '16px', padding: '12px', background: '#f59e0b18', border: '1px solid #f59e0b30', borderRadius: '6px', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>A primeira linha do CSV deve conter os cabeçalhos. Produtos existentes com o mesmo SKU serão atualizados.</span>
        </div>
      </div>
    </div>
  )
}
