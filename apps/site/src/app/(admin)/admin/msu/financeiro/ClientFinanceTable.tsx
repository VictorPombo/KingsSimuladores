'use client'

import React, { useState } from 'react'
import { Button } from '@kings/ui'
import { CheckCircle, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ClientFinanceTable({ initialPayouts }: { initialPayouts: any[] }) {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  const handlePay = async (payoutId: string) => {
    if (!confirm('Você confirma que já realizou o PIX para a chave do Vendedor?')) return

    setProcessing(payoutId)
    try {
      const res = await fetch('/api/admin/msu/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao dar baixa.')
      }

      // Remove otimisticamente
      setPayouts(prev => prev.filter(p => p.id !== payoutId))
      router.refresh()
    } catch (e: any) {
      alert(`Erro: ${e.message}`)
    } finally {
      setProcessing(null)
    }
  }

  if (payouts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: '#111', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Contas Zeradas!</h3>
        <p style={{ color: '#a1a1aa' }}>Não há nenhum repasse na fila aguardando PIX da Kings.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#111', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <th style={{ padding: '1.5rem 1rem', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase' }}>Vendedor</th>
            <th style={{ padding: '1.5rem 1rem', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase' }}>Chave PIX</th>
            <th style={{ padding: '1.5rem 1rem', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase' }}>Produto (Referência)</th>
            <th style={{ padding: '1.5rem 1rem', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase' }}>Valor a Pagar</th>
            <th style={{ padding: '1.5rem 1rem', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map(payout => (
            <tr key={payout.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
              <td style={{ padding: '1.5rem 1rem' }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{payout.seller?.full_name || 'Desconhecido'}</div>
                <div style={{ fontSize: '0.8rem', color: '#71717a' }}>{payout.seller?.email || 'N/A'}</div>
              </td>
              <td style={{ padding: '1.5rem 1rem', fontFamily: 'monospace', color: '#00e5ff', fontSize: '0.9rem' }}>
                {payout.seller?.pix_key ? payout.seller.pix_key : <span style={{ color: '#ef4444' }}>Não cadastrada</span>}
              </td>
              <td style={{ padding: '1.5rem 1rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                {payout.order_item?.product?.title || 'Produto Desconhecido'}
              </td>
              <td style={{ padding: '1.5rem 1rem' }}>
                <div style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.1rem' }}>
                  R$ {Number(payout.net_amount).toFixed(2).replace('.', ',')}
                </div>
              </td>
              <td style={{ padding: '1.5rem 1rem', textAlign: 'center' }}>
                <Button 
                  onClick={() => handlePay(payout.id)}
                  disabled={processing === payout.id || !payout.seller?.pix_key}
                  style={{ 
                    background: payout.seller?.pix_key ? '#E8002D' : '#333', 
                    color: payout.seller?.pix_key ? '#fff' : '#777', 
                    border: 'none', 
                    fontWeight: 700, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    padding: '10px 16px',
                    opacity: processing === payout.id ? 0.7 : 1,
                    cursor: processing === payout.id || !payout.seller?.pix_key ? 'not-allowed' : 'pointer'
                  }}
                >
                  <DollarSign size={16} /> {processing === payout.id ? 'Baixando...' : 'Marcar como Pago'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
