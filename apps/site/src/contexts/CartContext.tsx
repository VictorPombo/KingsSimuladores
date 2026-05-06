'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  title: string
  price: number
  imageUrl: string
  brand: string
  storeOrigin: 'kings' | 'msu' | 'seven'
  quantity: number
  dimensions?: { weight: number, width: number, height: number, length: number }
}

export interface CouponState {
  id: string
  code: string
  type: 'percent' | 'fixed' | 'shipping'
  value: number
}

interface CartContextData {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  subtotal: number
  discount: number
  coupon: CouponState | null
  applyCoupon: (c: CouponState | null) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [coupon, setCoupon] = useState<CouponState | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    const saved = localStorage.getItem('@kings/cart')
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch (e) {}
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('@kings/cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (newItem: CartItem) => {
    // 1. Fluxo Unificado: Permite itens de diferentes marcas/lojas juntas
    setItems(current => {
      const existingInfo = current.find(item => item.id === newItem.id)
      if (existingInfo) {
        return current.map(item => 
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        )
      }
      return [...current, newItem]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems(current => current.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(current => current.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  
  let discount = 0
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = subtotal * (coupon.value / 100)
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, subtotal)
    }
  }
  
  const totalPrice = subtotal - discount

  const applyCoupon = (c: CouponState | null) => setCoupon(c)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, 
      totalItems, subtotal, discount, totalPrice, coupon, applyCoupon, isOpen, setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
