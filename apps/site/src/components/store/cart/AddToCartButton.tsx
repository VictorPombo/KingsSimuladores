'use client'

import React, { useState } from 'react'
import { useCart, CartItem } from '@/contexts/CartContext'
import { Button } from '@kings/ui'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { items, addItem, clearCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleAdd = () => {
    // Validação de carrinho misto removida a pedido (agora permite misturar lojas)

    // GA4 add_to_cart event
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: product.price,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            quantity: 1
          }
        ]
      })
    }

    setLoading(true)
    setTimeout(() => {
      addItem({ ...product, quantity: 1 })
      setLoading(false)
    }, 400) // Simula feedback tátil + delay realistico leve
  }

  return (
    <Button size="lg" style={{ width: '100%' }} onClick={handleAdd} loading={loading}>
      ADICIONAR AO CARRINHO
    </Button>
  )
}
