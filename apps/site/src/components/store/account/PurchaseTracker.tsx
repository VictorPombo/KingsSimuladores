'use client'

import { useEffect, useState } from 'react'

export function PurchaseTracker({ order }: { order: any }) {
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    if (order && !tracked && typeof window !== 'undefined' && (window as any).fbq) {
      // Avoid tracking the same order multiple times if they refresh
      const trackedKey = `kings_tracked_order_${order.id}`
      if (localStorage.getItem(trackedKey)) {
        setTracked(true)
        return
      }

      (window as any).fbq('track', 'Purchase', {
        content_ids: order.items?.map((i: any) => i.id) || [order.id],
        value: order.total,
        currency: 'BRL',
        num_items: order.items?.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0) || 1
      })
      
      localStorage.setItem(trackedKey, 'true')
      
      // Limpar o carrinho apenas aqui (Página de Sucesso), para não perder caso volte do checkout
      try {
        const kingsCart = localStorage.getItem('kings_cart')
        if (kingsCart) {
          localStorage.removeItem('kings_cart')
          window.dispatchEvent(new Event('cartUpdated'))
        }
      } catch(e) {}

      setTracked(true)
    }
  }, [order, tracked])

  return null
}
