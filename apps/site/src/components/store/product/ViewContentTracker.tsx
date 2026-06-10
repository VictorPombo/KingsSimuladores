'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function ViewContentTracker({ product }: { product: any }) {
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    if (product && !tracked && typeof window !== 'undefined') {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_ids: [product.id || product.sku],
          content_name: product.title,
          content_type: 'product',
          value: product.price,
          currency: 'BRL'
        })
      }

      // GA4 view_item event
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'view_item', {
          currency: 'BRL',
          value: product.price,
          items: [
            {
              item_id: product.id || product.sku,
              item_name: product.title,
              price: product.price,
              quantity: 1
            }
          ]
        })
      }
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      Promise.resolve(supabase.rpc('increment_product_views', { p_id: product.id })).catch(console.error)

      setTracked(true)
    }
  }, [product, tracked])

  return null
}
