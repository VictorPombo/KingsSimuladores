'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'

export function PurchaseTracker({ order }: { order: any }) {
  const [tracked, setTracked] = useState(false)
  const { clearCart } = useCart()

  useEffect(() => {
    if (order && !tracked) {
      // Clear the cart since the purchase was successful
      clearCart()
      
      if (typeof window !== 'undefined' && (window as any).fbq) {
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
        setTracked(true)
      }
    }
  }, [order, tracked, clearCart])

  return null
}
