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
    // 1. Validar se o carrinho tem produtos de outra loja
    if (items.length > 0) {
      const currentOrigin = items[0].storeOrigin;
      if (currentOrigin !== product.storeOrigin) {
        const storeNameMap: Record<string, string> = { kings: 'Kings Simuladores', seven: 'Seven Sim Racing', msu: 'Meu Simulador Usado' };
        const confirmed = window.confirm(`Seu carrinho atual já possui itens da ${storeNameMap[currentOrigin]}.\n\nPara prosseguir, você precisa finalizar os pedidos separadamente.\nDeseja limpar o carrinho atual e adicionar este novo produto?`);
        if (confirmed) {
          clearCart();
        } else {
          return;
        }
      }
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
