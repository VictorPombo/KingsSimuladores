'use client'

import React from 'react'
import { Button } from '@kings/ui'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'

interface Props {
  listingId: string
  listingTitle: string
  listingPrice: number
  imageUrl: string
  sellerId: string
}

export function BuyNowButton({ listingId, listingTitle, listingPrice, imageUrl, sellerId }: Props) {
  const { addItem } = useCart()
  const router = useRouter()

  const handleBuyNow = () => {
    // 1. Add item to cart
    addItem({
      id: listingId,
      title: listingTitle,
      price: listingPrice,
      imageUrl: imageUrl,
      brand: 'MSU',
      quantity: 1,
      storeOrigin: 'msu',
    })
    
    // 2. Redirect to universal checkout
    router.push('/checkout')
  }

  return (
    <Button 
      onClick={handleBuyNow}
      style={{ width: '100%', background: 'var(--accent)', color: '#000', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}
    >
      Comprar Agora
    </Button>
  )
}
