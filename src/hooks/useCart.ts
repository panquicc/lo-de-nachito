// src/hooks/useCart.ts
'use client'

import { useState } from 'react'
import { Product } from '@/lib/api/products'
import { toast } from 'sonner'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  stock?: number
  isComposite?: boolean
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id)
      
      if (existingItem) {
        if (product.track_stock && product.stock !== null && existingItem.quantity + 1 > product.stock) {
          toast.warning('No hay suficiente stock disponible')
          return currentCart
        }
        
        return currentCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      
      const newCart = [...currentCart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock || undefined,
        isComposite: product.is_composite
      }]

      toast.success(`✅ ${product.name} agregado`, {
        description: `Carrito: ${newCart.reduce((sum, item) => sum + item.quantity, 0)} productos`,
        duration: 2000,
      })

      return newCart
    })
  }

  const updateQuantity = (productId: string, newQuantity: number, availableStock?: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    if (availableStock !== undefined && newQuantity > availableStock) {
      toast.warning('No hay suficiente stock disponible')
      return
    }
    
    setCart(currentCart =>
      currentCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(currentCart => {
      const removedItem = currentCart.find(item => item.productId === productId)
      const newCart = currentCart.filter(item => item.productId !== productId)
      
      if (removedItem) {
        toast.info(`🗑️ ${removedItem.name} eliminado`, {
          duration: 2000,
        })
      }
      
      return newCart
    })
  }

  const clearCart = () => {
    if (cart.length > 0) {
      toast.info('Carrito vaciado')
    }
    setCart([])
  }

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItems
  }
}