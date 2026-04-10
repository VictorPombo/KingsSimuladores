'use client'

import React, { useTransition } from 'react'
import { ArchiveRestore, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { restoreProductAction, deleteProductPermanentlyAction } from './actions'

export function LixeiraClient({ products }: { products: any[] }) {
  const [isPending, startTransition] = useTransition()

  const handleRestore = (id: string, name: string) => {
    if (confirm(`Restaurar "${name}" como Rascunho?`)) {
      startTransition(async () => {
        const res = await restoreProductAction(id)
        if (!res.success) alert('Erro ao restaurar: ' + res.error)
      })
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`CUIDADO: Tem certeza que deseja apagar "${name}" PERMANENTEMENTE? Esta ação não pode ser desfeita.`)) {
      startTransition(async () => {
        const res = await deleteProductPermanentlyAction(id)
        if (!res.success) alert('Erro ao excluir: ' + res.error)
      })
    }
  }

  return (
    <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr>
              {['Produto', 'SKU', 'Preço', 'Estoque', 'Arquivado em', 'Ações'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Ações' ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(!products || products.length === 0) ? (
              <tr><td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={32} opacity={0.5} />
                  A lixeira está vazia. Produtos arquivados aparecerão aqui.
                </div>
              </td></tr>
            ) : products.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #3f424d', opacity: isPending ? 0.5 : 1 }}
                onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent' }}>
                <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '0.85rem' }}>{p.title}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{p.sku || '-'}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8' }}>R$ {Number(p.price).toFixed(2)}</td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>{p.stock} un.</td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      disabled={isPending}
                      onClick={() => handleRestore(p.id, p.title)}
                      title="Restaurar para Rascunho"
                      style={{ background: '#10b98115', border: '1px solid #10b98130', color: '#10b981', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      <ArchiveRestore size={14} /> Restaurar
                    </button>
                    <button 
                      disabled={isPending}
                      onClick={() => handleDelete(p.id, p.title)}
                      title="Deletar Permanentemente"
                      style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
