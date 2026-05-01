'use client'

import React, { useState, useEffect } from 'react'

interface Props {
  orderId: string
  initialStatus: string
}

export function OrderStatusBadge({ orderId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    // Apenas faz polling se estiver pendente
    if (status !== 'pending') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?id=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status && data.status !== 'pending') {
            setStatus(data.status)
            clearInterval(interval)
          }
        }
      } catch (err) {
        console.error('Erro no polling do pedido:', err)
      }
    }, 5000) // 5 segundos

    // Para de verificar após 10 minutos (timeout)
    const timeout = setTimeout(() => {
      clearInterval(interval)
    }, 10 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [orderId, status])

  const isPaid = status === 'paid'

  const statusMap: Record<string, string> = {
    pending: 'PROCESSANDO...',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    canceled: 'Cancelado'
  }

  const displayStatus = statusMap[status] || status.toUpperCase()

  return (
    <div style={{ 
      display: 'inline-block',
      padding: '0.2rem 0.5rem',
      borderRadius: '1rem',
      fontSize: '0.8rem',
      background: isPaid ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)',
      color: isPaid ? '#00e5ff' : '#fff',
      transition: 'all 0.3s ease'
    }}>
      {displayStatus}
    </div>
  )
}
