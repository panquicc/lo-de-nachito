// src/hooks/useProductsWithStock.ts
'use client'

import { useProducts } from './useProducts'
import { useQueryClient } from '@tanstack/react-query'

export function useProductsWithStock() {
  const queryClient = useQueryClient()
  const { data: products, isLoading, error } = useProducts()

  // Función para obtener stock actualizado de un producto
  const getProductStock = (productId: string): number | null => {
    const queryData = queryClient.getQueryData<any>(['products'])
    const currentProduct = queryData?.find((p: any) => p.id === productId)
    return currentProduct?.stock ?? null
  }

  // Función para invalidar y refetch productos (actualizar stock)
  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  return {
    products,
    isLoading,
    error,
    getProductStock,
    refreshProducts
  }
}