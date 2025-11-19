// src/components/kiosk/ProductGrid.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/api/products'
import { Zap } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
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
      if (product.stock < 3) return 'VERY_LOW_STOCK'
      if (product.stock < 10) return 'LOW_STOCK'
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
    if (product.stock === null) return 'STOCK ∞'
    return `STOCK ${product.stock}`
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
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
            className={`group h-auto p-3 flex flex-col items-center justify-center space-y-2 relative transition-all hover:shadow-md hover:z-20 ${isComposite ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300' : 'hover:border-gray-300'
              } ${isOutOfStock ? 'opacity-50' : ''}`}
            onClick={() => onAddToCart(product)}
          >
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-100/90 flex items-center justify-center rounded-md z-10">
                <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">SIN STOCK</span>
              </div>
            )}

            {isComposite && (
              <div className="absolute top-2 right-2 text-blue-500" title="Producto Compuesto">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </div>
            )}

            <div className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>

            <div className="text-sm text-center leading-tight line-clamp-2 min-h-[2.5em] flex items-center justify-center w-full text-gray-700 font-medium">
              {product.name}
            </div>

            {/* Custom Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg whitespace-normal text-center hidden group-hover:block">
              {product.name}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>

            <Badge
              variant={getProductBadgeVariant(product)}
              className="text-[10px] px-1.5 py-0 h-5"
            >
              {getProductBadgeText(product)}
            </Badge>
          </Button>
        )
      })}
    </div>
  )
}