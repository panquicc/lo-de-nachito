// src/components/kiosk/Cart.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, Trash2, Loader2, X, Zap } from 'lucide-react'
import { CartItem, useCart } from '@/hooks/useCart'
import { useProductsWithStock } from '@/hooks/useProductsWithStock'
import { PaymentMethod } from '@/lib/api/sales'
import { Booking } from '@/lib/api/bookings'

interface CartProps {
  isOpen: boolean
  onClose: () => void
  selectedBooking: string
  onBookingChange: (bookingId: string) => void
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  bookings?: Booking[]
  bookingsLoading?: boolean
  onCheckout: () => void
  checkoutLoading: boolean
}

export function Cart({ 
  isOpen, 
  onClose, 
  selectedBooking, 
  onBookingChange, 
  paymentMethod, 
  onPaymentMethodChange, 
  bookings, 
  bookingsLoading, 
  onCheckout, 
  checkoutLoading 
}: CartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart()
  const { getProductStock } = useProductsWithStock()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Carrito */}
      <div className={`
        fixed lg:static right-0 top-0 bottom-0 z-50 
        w-full max-w-md lg:max-w-none lg:w-auto
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${!isOpen ? 'lg:block hidden' : ''}
      `}>
        <div className="bg-white border-l lg:border rounded-lg lg:rounded-none h-full lg:h-auto shadow-xl lg:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span className="font-semibold">Carrito de Venta</span>
              {cart.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalItems} items
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido */}
          <div className="p-4 h-[calc(100vh-120px)] lg:h-[70vh] overflow-y-auto">
            {/* Selectores */}
            <div className="space-y-3 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asociar a turno (opcional)</label>
                <select
                  value={selectedBooking}
                  onChange={(e) => onBookingChange(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  disabled={bookingsLoading}
                >
                  <option value="">Seleccionar turno...</option>
                  {bookings?.map((booking: Booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.courts?.name} - {new Date(booking.start_time).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} ({booking.clients?.name || 'Cliente ocasional'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>
            </div>

            {/* Items del carrito */}
            <div className="space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">El carrito está vacío</p>
                </div>
              ) : (
                <>
                  {cart.map((item: CartItem) => {
                    const currentStock = getProductStock(item.productId)
                    const availableStock = currentStock ?? item.stock
                    
                    return (
                      <div 
                        key={item.productId} 
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          item.isComposite ? 'border-blue-200 bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <div className="font-medium text-sm truncate">{item.name}</div>
                            {item.isComposite && (
                              <Zap className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPrice(item.price)} c/u
                            {availableStock !== undefined && (
                              <span className="ml-2">• Stock: {availableStock}</span>
                            )}
                          </div>
                          <div className="text-xs font-semibold">
                            Total: {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, availableStock)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, availableStock)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.productId)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full mt-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vaciar Carrito
                  </Button>
                </>
              )}
            </div>

            {/* Checkout */}
            {cart.length > 0 && (
              <div className="mt-6 space-y-3 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={onCheckout}
                  disabled={checkoutLoading}
                  size="lg"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Procesar Venta
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}