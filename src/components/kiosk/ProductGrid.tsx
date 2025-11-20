'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/api/products'
import { Zap } from 'lucide-react'


// Define la interfaz de props para el componente ProductGrid.
interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  // Nuevo prop: un mapa de IDs de producto a la cantidad de ese producto en el carrito.
  cartQuantities: Map<string, number>
}

// El componente ProductGrid muestra una lista de productos con sus detalles y una acción de añadir al carrito.
export function ProductGrid({ products, onAddToCart, cartQuantities }: ProductGridProps) {
  // Formatea un número como moneda de Pesos Argentinos.
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  // Calcula el stock efectivo de un producto, restando la cantidad en el carrito.
  const getEffectiveStock = (product: Product) => {
    if (!product.track_stock || product.stock === null) {
      return null // No se controla el stock o es infinito
    }
    const quantityInCart = cartQuantities.get(product.id) || 0
    return product.stock - quantityInCart
  }

  // Determina el estado del stock de un producto basándose en varias condiciones.
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

  // Devuelve la variante apropiada para la insignia del producto según su estado de stock.
  const getProductBadgeVariant = (product: Product) => {
    const status = getProductStockStatus(product)
    if (status === 'OUT_OF_STOCK') return 'destructive'
    if (status === 'VERY_LOW_STOCK') return 'destructive'
    if (status === 'LOW_STOCK') return 'default'
    if (status === 'INVALID_PRICE') return 'destructive'
    if (product.is_composite) return 'secondary'
    return 'secondary'
  }

  // Devuelve el texto a mostrar en la insignia del producto según su estado.
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

  // Renderiza un mensaje cuando no se encuentran productos.
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta con otros filtros o búsqueda</p>
      </div>
    )
  }

  // Renderiza la lista de productos.
  return (
    <div className="flex flex-col gap-2">
      {/* Itera sobre el array de productos para renderizar cada producto como un botón clickeable. */}
      {products.map((product) => {
        const stockStatus = getProductStockStatus(product)
        const isOutOfStock = stockStatus === 'OUT_OF_STOCK'
        const isComposite = product.is_composite

        return (
          // Componente Button para cada producto, estilizado según su estado.
          <Button
            key={product.id}
            variant={isOutOfStock ? "ghost" : "outline"}
            disabled={isOutOfStock}
            title={product.name}
            className={`group relative w-full flex items-center justify-between p-3 transition-all hover:shadow-md hover:z-20 ${isComposite ? 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300' : 'hover:border-gray-300'
              } ${isOutOfStock ? 'opacity-50' : ''}`}
            onClick={() => onAddToCart(product)}
          >
            {/* Contenido principal del producto: precio, nombre e icono compuesto */}
            <div className="flex items-center gap-3">
              {isComposite && (
                <Zap className="h-4 w-4 fill-current text-blue-500" />
              )}
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>
              <div className="text-base text-gray-700 font-medium line-clamp-1">
                {product.name}
              </div>
            </div>

            {/* Tooltip personalizado que aparece al pasar el ratón, mostrando el nombre completo del producto. */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg whitespace-normal text-center hidden group-hover:block">
              {product.name}
              {/* Flecha para el tooltip. */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
            </div>

            {/* Insignia que muestra información de stock o tipo de producto. */}
            {isOutOfStock ? (
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border shadow-sm">SIN STOCK</span>
            ) : (
              <Badge
                variant={getProductBadgeVariant(product)}
                className="text-[10px] px-1.5 py-0 h-5"
              >
                {getProductBadgeText(product)}
              </Badge>
            )}
          </Button>
        )
      })}
    </div>
  )
}