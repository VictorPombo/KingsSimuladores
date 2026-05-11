'use client'

import { useEffect, useState } from 'react'

export function ViewContentTracker({ product }: { product: any }) {
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    if (product && !tracked && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [product.id || product.sku],
        content_name: product.title,
        content_type: 'product',
        value: product.price,
        currency: 'BRL'
      })
      setTracked(true)
    }
  }, [product, tracked])

  return null
}
