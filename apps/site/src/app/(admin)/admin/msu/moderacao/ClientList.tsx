'use client'

import React, { useState } from 'react'
import { Button } from '@kings/ui'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ClientList({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  const handleAction = async (productId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Tem certeza que deseja ${action === 'approve' ? 'APROVAR' : 'RECUSAR'} este anúncio?`)) return

    setProcessing(productId)
    try {
      const res = await fetch('/api/admin/msu/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro na moderação')
      }

      // Remover o produto da lista otimisticamente
      setProducts(prev => prev.filter(p => p.id !== productId))
      router.refresh()
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    } finally {
      setProcessing(null)
    }
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: '#111', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tudo Limpo!</h3>
        <p style={{ color: '#a1a1aa' }}>Não há nenhum anúncio pendente de moderação na fila.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {products.map(product => (
        <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#111', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
            {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              <Clock size={12} /> Pending Review
            </div>
            
            <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '4px', color: '#fff' }}>{product.title}</h3>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#E8002D', marginBottom: '12px' }}>
              R$ {Number(product.price).toFixed(2).replace('.', ',')}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
              <div>
                <strong>Vendedor:</strong> {product.seller?.full_name || 'Desconhecido'} <br/>
                <span style={{ fontSize: '0.75rem' }}>({product.seller?.email || 'N/A'})</span>
              </div>
              <div>
                <strong>Condição:</strong> {product.attributes?.condition || 'N/A'} <br/>
                <strong>Marca/Modelo:</strong> {product.attributes?.brand_name || '-'} / {product.attributes?.model || '-'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
            <Button 
              onClick={() => handleAction(product.id, 'approve')}
              disabled={processing === product.id}
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              <CheckCircle size={18} /> {processing === product.id ? '...' : 'Aprovar'}
            </Button>
            <Button 
              onClick={() => handleAction(product.id, 'reject')}
              disabled={processing === product.id}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              <XCircle size={18} /> {processing === product.id ? '...' : 'Recusar'}
            </Button>
          </div>
          
        </div>
      ))}
    </div>
  )
}
