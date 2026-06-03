'use client'

import { useEffect, useState } from 'react'

export function PurchaseTracker({ order }: { order: any }) {
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    if (order && !tracked && typeof window !== 'undefined') {
      // Avoid tracking the same order multiple times if they refresh
      const trackedKey = `kings_tracked_order_${order.id}`
      if (localStorage.getItem(trackedKey)) {
        setTracked(true)
        return
      }

      // Track on Facebook Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          content_ids: order.items?.map((i: any) => i.id) || [order.id],
          value: order.total,
          currency: 'BRL',
          num_items: order.items?.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0) || 1
        })
      }

      // Track on Google Ads
      const gtag = (window as any).gtag || function(...args: any[]) {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push(args);
      };
      gtag('event', 'purchase', {
        transaction_id: order.id,
        value: order.total,
        currency: 'BRL',
        items: order.items?.map((i: any) => ({
          item_id: i.id,
          item_name: i.title,
          price: i.price,
          quantity: i.quantity
        }))
      });
      
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
