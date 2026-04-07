'use client'

import React, { useState } from 'react'
import { useCart, CartItem } from '@/contexts/CartContext'
import { Button } from '@kings/ui'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [loading, setLoading] = useState(false)

  const handleAdd = () => {
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
