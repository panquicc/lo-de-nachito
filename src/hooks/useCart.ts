// src/hooks/useCart.ts
'use client'

import { useState, useCallback } from 'react'
import { Product } from '@/lib/api/products'
import { toast } from 'sonner'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  stock?: number
  isComposite?: boolean
  trackStock?: boolean
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  // Validar si un producto puede ser agregado al carrito
  const canAddToCart = useCallback((product: Product, currentQuantity: number = 0): { canAdd: boolean; reason?: string } => {
    // 1. Verificar que el producto esté activo
    if (!product.is_active) {
      return { canAdd: false, reason: 'Producto inactivo' }
    }

    // 2. Verificar stock para productos con control de stock
    if (product.track_stock && product.stock !== null) {
      if (product.stock <= 0) {
        return { canAdd: false, reason: 'Producto sin stock disponible' }
      }

      if (currentQuantity >= product.stock) {
        return { canAdd: false, reason: 'No hay suficiente stock disponible' }
      }
    }

    // 3. Verificar que el precio sea válido
    if (product.price <= 0) {
      return { canAdd: false, reason: 'Precio inválido' }
    }

    return { canAdd: true }
  }, [])

  const addToCart = (product: Product) => {
    const validation = canAddToCart(product)
    if (!validation.canAdd) {
      toast.warning(validation.reason || 'No se puede agregar el producto')
      return
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id)

      if (existingItem) {
        // Validar stock al incrementar cantidad
        const newQuantity = existingItem.quantity + 1
        const incrementValidation = canAddToCart(product, newQuantity - 1) // -1 porque ya está en el carrito

        if (!incrementValidation.canAdd) {
          toast.warning(incrementValidation.reason || 'No hay suficiente stock disponible')
          return currentCart
        }

        return currentCart.map(item =>
          item.productId === product.id
            ? {
              ...item,
              quantity: newQuantity,
              trackStock: product.track_stock
            }
            : item
        )
      }

      const newCart = [...currentCart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock || undefined,
        isComposite: product.is_composite,
        trackStock: product.track_stock
      }]

      toast.success(`✅ ${product.name} agregado`, {
        description: `Carrito: ${newCart.reduce((sum, item) => sum + item.quantity, 0)} productos`,
        duration: 2000,
      })

      return newCart
    })
  }

  const updateQuantity = (productId: string, newQuantity: number, availableStock?: number) => {
    if (newQuantity < 0) {
      toast.error('La cantidad no puede ser negativa')
      return
    }

    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    // Validar stock máximo
    if (availableStock !== undefined && newQuantity > availableStock) {
      toast.warning(`Stock máximo: ${availableStock} unidades`)
      return
    }

    // Validar que la cantidad sea un número entero positivo
    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      toast.error('La cantidad debe ser un número entero positivo')
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

  // Validar todo el carrito antes del checkout
  const validateCartForCheckout = useCallback((products: Product[] = []) => {
    const errors: string[] = []

    if (cart.length === 0) {
      errors.push('El carrito está vacío')
      return { isValid: false, errors }
    }

    for (const item of cart) {
      const product = products.find(p => p.id === item.productId)

      if (!product) {
        errors.push(`Producto "${item.name}" no encontrado`)
        continue
      }

      if (!product.is_active) {
        errors.push(`Producto "${item.name}" está inactivo`)
        continue
      }

      if (product.track_stock && product.stock !== null) {
        if (product.stock < item.quantity) {
          errors.push(`Stock insuficiente para "${item.name}" (solicitado: ${item.quantity}, disponible: ${product.stock})`)
        }

        if (product.stock <= 0) {
          errors.push(`Producto "${item.name}" sin stock disponible`)
        }
      }

      if (product.price <= 0) {
        errors.push(`Precio inválido para "${item.name}"`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [cart])

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItems,
    validateCartForCheckout,
    canAddToCart
  }
}