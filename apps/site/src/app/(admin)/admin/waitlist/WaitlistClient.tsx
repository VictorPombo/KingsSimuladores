'use client'

import { useState, useMemo } from 'react'
import { Card, Button, Badge } from '@kings/ui'
import { MessageCircle, BellRing } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function WaitlistClient({ data }: { data: any[] }) {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const grouped = useMemo(() => {
    const map = new Map<string, { product: any, pending: any[], notified: any[] }>()
    
    for (const item of data) {
      if (!item.product) continue // Se o produto foi deletado
      
      const pId = item.product_id
      if (!map.has(pId)) {
        map.set(pId, { product: item.product, pending: [], notified: [] })
      }
      
      if (item.status === 'pending') map.get(pId)!.pending.push(item)
      else map.get(pId)!.notified.push(item)
    }
    
    return Array.from(map.entries())
  }, [data])

  const handleNotify = async (productId: string) => {
    if (!confirm('Deseja enviar WhatsApp via Z-API para todos os clientes pendentes deste produto?')) return
    
    setLoadingMap(prev => ({ ...prev, [productId]: true }))
    try {
      const res = await fetch('/api/admin/waitlist/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Erro ao notificar')
      
      alert('Notificações enviadas com sucesso!')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoadingMap(prev => ({ ...prev, [productId]: false }))
    }
  }

  if (grouped.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Fila de Espera</h1>
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Nenhum produto com fila de espera no momento.</p>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Fila de Espera</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Clientes aguardando reposição de estoque</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {grouped.map(([productId, group]) => (
          <Card key={productId} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#fff', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <img src={group.product.images?.[0] || ''} alt={group.product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700 }}>{group.product.title}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Badge variant="warning">{group.pending.length} Pendentes</Badge>
                    <Badge variant="success">{group.notified.length} Notificados</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Button 
                  variant="primary" 
                  onClick={() => handleNotify(productId)}
                  disabled={group.pending.length === 0 || loadingMap[productId]}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageCircle size={18} />
                  {loadingMap[productId] ? 'Enviando...' : 'Notificar Todos Pendentes'}
                </Button>
              </div>
            </div>

            {/* Listagem Rápida */}
            {group.pending.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Fila Pendente</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {group.pending.map(p => (
                    <div key={p.id} style={{ 
                      padding: '6px 12px', background: 'var(--bg-subtle)', 
                      borderRadius: '100px', fontSize: '0.85rem', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <span style={{ fontWeight: 600 }}>{p.customer_name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{p.customer_phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
