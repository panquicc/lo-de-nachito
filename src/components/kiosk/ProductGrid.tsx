'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/api/products'
import { Zap } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  cartQuantities: Map<string, number>
}

export function ProductGrid({ products, onAddToCart, cartQuantities }: ProductGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const getEffectiveStock = (product: Product) => {
    if (!product.track_stock || product.stock === null) {
      return null
    }
    const quantityInCart = cartQuantities.get(product.id) || 0
    return product.stock - quantityInCart
  }

  const getProductStockStatus = (product: Product) => {
    if (!product.is_active) return 'INACTIVE'
    if (product.track_stock) {
      const effectiveStock = getEffectiveStock(product)
      if (effectiveStock !== null) {
        if (effectiveStock <= 0) return 'OUT_OF_STOCK'
        if (effectiveStock < 3) return 'VERY_LOW_STOCK'
        if (effectiveStock < 10) return 'LOW_STOCK'
      }
    }
    if (product.price <= 0) return 'INVALID_PRICE'
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
    const effectiveStock = getEffectiveStock(product)
    if (effectiveStock === null) return 'STOCK ∞'
    if (status === 'OUT_OF_STOCK') return 'AGOTADO'
    if (status === 'VERY_LOW_STOCK') return `¡QUEDAN ${effectiveStock}!`
    if (status === 'LOW_STOCK') return `QUEDAN ${effectiveStock}`
    return `STOCK ${effectiveStock}`
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta con otros filtros o búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => {
        const stockStatus = getProductStockStatus(product)
        const isOutOfStock = stockStatus === 'OUT_OF_STOCK'
        const isComposite = product.is_composite

        return (
          <Button
            key={product.id}
            variant={isOutOfStock ? "ghost" : "outline"}
            disabled={isOutOfStock}
            title={product.name}
            className={`group relative w-full h-auto min-h-[6rem] flex flex-col items-start justify-between p-3 transition-all hover:shadow-md hover:z-20 ${isComposite ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300' : 'hover:border-gray-300'
              } ${isOutOfStock ? 'opacity-50' : ''}`}
            onClick={() => onAddToCart(product)}
          >
            <div className="w-full flex flex-col items-start gap-1">
              <div className="w-full flex justify-between items-start">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                {isComposite && (
                  <Zap className="h-4 w-4 fill-current text-blue-500 shrink-0" />
                )}
              </div>
              <div className="text-sm text-gray-700 font-medium line-clamp-2 text-left whitespace-normal leading-tight">
                {product.name}
              </div>
            </div>

            <div className="w-full mt-2 flex justify-end">
              {isOutOfStock ? (
                <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border shadow-sm">SIN STOCK</span>
              ) : (
                <Badge
                  variant={getProductBadgeVariant(product)}
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {getProductBadgeText(product)}
                </Badge>
              )}
            </div>
          </Button>
        )
      })}
    </div>
  )
}