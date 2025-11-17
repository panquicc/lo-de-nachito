// src/components/kiosk/ProductGrid.tsx
'use client'

import { useProductsWithStock } from '@/hooks/useProductsWithStock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/api/products'
import { Zap } from 'lucide-react'

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const { products, isLoading } = useProductsWithStock()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const getProductStockStatus = (product: Product) => {
    if (!product.is_active) return 'INACTIVE'
    if (product.track_stock && product.stock !== null) {
      if (product.stock <= 0) return 'OUT_OF_STOCK'
      if (product.stock < 3) return 'VERY_LOW_STOCK' // ← Nuevo estado
      if (product.stock < 10) return 'LOW_STOCK'
    }
    if (product.price <= 0) return 'INVALID_PRICE' // ← Nueva validación
    return 'AVAILABLE'
  }

  const getProductBadgeVariant = (product: Product) => {
    const status = getProductStockStatus(product)
    if (status === 'OUT_OF_STOCK') return 'destructive'
    if (status === 'VERY_LOW_STOCK') return 'destructive'
    if (status === 'LOW_STOCK') return 'default'
    if (status === 'INVALID_PRICE') return 'destructive'
    if (product.is_composite) return 'secondary'
    return 'secondary'
  }

  const getProductBadgeText = (product: Product) => {
    const status = getProductStockStatus(product)
    if (status === 'INVALID_PRICE') return 'PRECIO INVÁLIDO'
    if (product.is_composite) return 'COMPUESTO'
    if (!product.track_stock) return 'SIN CONTROL'
    if (product.stock === null) return 'STOCK ∞'
    return `STOCK ${product.stock}`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-20 sm:h-24 bg-gray-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    )
  }

  const activeProducts = products?.filter(product => product.is_active) || []

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {activeProducts.map((product) => {
        const stockStatus = getProductStockStatus(product)
        const isOutOfStock = stockStatus === 'OUT_OF_STOCK'
        const isComposite = product.is_composite

        return (
          <Button
            key={product.id}
            variant={isOutOfStock ? "ghost" : "outline"}
            disabled={isOutOfStock}
            className={`h-auto p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 sm:space-y-2 relative ${isComposite ? 'border-blue-300 bg-blue-50' : ''
              } ${isOutOfStock ? 'opacity-50' : ''}`}
            onClick={() => onAddToCart(product)}
          >
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center rounded-md">
                <span className="text-xs font-medium text-gray-500">SIN STOCK</span>
              </div>
            )}

            {isComposite && (
              <Zap className="h-3 w-3 text-blue-500 absolute top-1 right-1" />
            )}

            <div className="text-sm sm:text-lg font-semibold">
              {formatPrice(product.price)}
            </div>
            <div className="text-xs sm:text-sm text-center leading-tight line-clamp-2">
              {product.name}
            </div>
            <Badge
              variant={getProductBadgeVariant(product)}
              className="text-xs"
            >
              {getProductBadgeText(product)}
            </Badge>
          </Button>
        )
      })}
    </div>
  )
}