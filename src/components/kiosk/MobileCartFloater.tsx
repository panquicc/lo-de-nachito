// src/components/kiosk/MobileCartFloater.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface MobileCartFloaterProps {
  onOpenCart: () => void
  onClearCart: () => void
}

export function MobileCartFloater({ onOpenCart, onClearCart }: MobileCartFloaterProps) {
  const { cart, totalAmount, totalItems } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  if (cart.length === 0) return null

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-sm">Carrito</span>
            <Badge variant="secondary" className="text-xs">
              {totalItems} items
            </Badge>
          </div>
          <div className="text-lg font-bold text-green-600">
            {formatPrice(totalAmount)}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCart}
            className="flex-1 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Vaciar
          </Button>
          <Button
            onClick={onOpenCart}
            size="sm"
            className="flex-1 text-xs"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Ver Carrito
          </Button>
        </div>
      </div>
    </div>
  )
}