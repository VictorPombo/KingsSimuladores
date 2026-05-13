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
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      supabase.rpc('increment_product_views', { p_id: product.id }).catch(console.error)

      setTracked(true)
    }
  }, [product, tracked])

  return null
}
