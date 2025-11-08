// src/components/kiosk/KioskPOS.tsx (versión mejorada)
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, Trash2, ShoppingCart, Loader2, Zap, X } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useBookings } from '@/hooks/useBookings'
import type { Booking } from '@/lib/api/bookings'
import { useCreateSale } from '@/hooks/useSales'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@/lib/api/sales'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/api/products'
import { toast } from 'sonner'

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  stock?: number
  isComposite?: boolean
}

export default function KioskPOS() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedBooking, setSelectedBooking] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO')
  const [showCart, setShowCart] = useState(false)

  const { data: products, isLoading: productsLoading, error: productsError } = useProducts()
  const { data: bookings, isLoading: bookingsLoading } = useBookings(new Date().toISOString().split('T')[0])
  const createSaleMutation = useCreateSale()

  const addToCart = (product: Product) => {
    if (product.track_stock && product.stock !== null && product.stock <= 0) {
      toast.warning('Producto sin stock disponible')
      return
    }

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

      // Toast de confirmación rápida
      toast.success(`✅ ${product.name} agregado`, {
        description: `Carrito: ${newCart.reduce((sum, item) => sum + item.quantity, 0)} productos`,
        duration: 2000,
      })

      return newCart
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    const product = products?.find(p => p.id === productId)
    if (product && product.track_stock && product.stock !== null && newQuantity > product.stock) {
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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('El carrito está vacío')
      return
    }

    try {
      const saleData = {
        sale: {
          total_amount: totalAmount,
          payment_method: paymentMethod,
          client_id: undefined
        },
        items: cart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price
        })),
        bookingId: selectedBooking || undefined
      }

      await createSaleMutation.mutateAsync(saleData)
      
      toast.success('🎉 Venta procesada exitosamente')
      setCart([])
      setSelectedBooking('')
      setPaymentMethod('EFECTIVO')
      setShowCart(false)
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la venta')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const getProductStockStatus = (product: Product) => {
    if (!product.is_active) return 'INACTIVE'
    if (product.track_stock && product.stock === 0) return 'OUT_OF_STOCK'
    if (product.track_stock && product.stock && product.stock < 5) return 'LOW_STOCK'
    return 'AVAILABLE'
  }

  const getProductBadgeVariant = (product: Product) => {
    const status = getProductStockStatus(product)
    if (status === 'OUT_OF_STOCK') return 'destructive'
    if (status === 'LOW_STOCK') return 'default'
    if (product.is_composite) return 'secondary'
    return 'secondary'
  }

  const getProductBadgeText = (product: Product) => {
    if (product.is_composite) return 'COMPUESTO'
    if (!product.track_stock) return 'SIN CONTROL'
    if (product.stock === null) return 'STOCK ∞'
    return `STOCK ${product.stock}`
  }

  // Mini-carrito flotante para móvil
  const MobileCartFloater = () => {
    if (cart.length === 0 || showCart) return null

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
              onClick={clearCart}
              className="flex-1 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Vaciar
            </Button>
            <Button
              onClick={() => setShowCart(true)}
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

  if (productsLoading) {
    return (
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl sm:text-2xl">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-20 sm:h-24 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl sm:text-2xl">Carrito de Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 sm:h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (productsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600 text-sm sm:text-base">
            Error cargando productos: {productsError.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeProducts = products?.filter(product => product.is_active) || []

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Mini-carrito flotante para móvil */}
      <MobileCartFloater />

      {/* Productos - Siempre visible */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xl sm:text-2xl">Productos Disponibles</span>
            {/* Botón para abrir carrito en desktop */}
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowCart(true)}
                className="hidden lg:flex"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Carrito ({totalItems})
                <Badge variant="secondary" className="ml-2">
                  {formatPrice(totalAmount)}
                </Badge>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {activeProducts.map((product) => {
              const stockStatus = getProductStockStatus(product)
              const isOutOfStock = stockStatus === 'OUT_OF_STOCK'
              const isLowStock = stockStatus === 'LOW_STOCK'
              const isComposite = product.is_composite
              
              return (
                <Button
                  key={product.id}
                  variant={isOutOfStock ? "ghost" : "outline"}
                  disabled={isOutOfStock}
                  className={`h-auto p-2 sm:p-3 flex flex-col items-center justify-center space-y-1 sm:space-y-2 relative ${
                    isComposite ? 'border-blue-300 bg-blue-50' : ''
                  } ${isOutOfStock ? 'opacity-50' : ''}`}
                  onClick={() => addToCart(product)}
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
        </CardContent>
      </Card>

      {/* Carrito - Drawer en móvil, sidebar en desktop */}
      {showCart && (
        <>
          {/* Overlay para móvil */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
          />
          
          {/* Carrito */}
          <Card className={`
            fixed lg:static right-0 top-0 bottom-0 z-50 
            w-full max-w-md lg:max-w-none lg:w-auto
            transform transition-transform duration-300
            ${showCart ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-xl sm:text-2xl">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrito de Venta
                {cart.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalItems} items
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCart(false)}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="h-[calc(100vh-120px)] lg:h-auto overflow-y-auto">
              {/* Selector de turno y método de pago */}
              <div className="space-y-3 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asociar a turno (opcional)</label>
                  <select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
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
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
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
                    <p className="text-sm sm:text-base">El carrito está vacío</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setShowCart(false)}
                    >
                      Agregar productos
                    </Button>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div 
                        key={item.productId} 
                        className={`flex items-center justify-between p-3 border rounded-lg bg-white ${
                          item.isComposite ? 'border-blue-200 bg-blue-50' : ''
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
                          </div>
                          <div className="text-xs font-semibold">
                            Total: {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
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
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
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
                    ))}
                    
                    {/* Botón vaciar carrito */}
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

              {/* Total y botón de checkout */}
              {cart.length > 0 && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-base">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {cart.some(item => item.isComposite) && (
                      <p className="text-blue-600">
                        ⓘ Los productos compuestos incluyen sus componentes
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleCheckout}
                    disabled={createSaleMutation.isPending}
                    size="lg"
                  >
                    {createSaleMutation.isPending ? (
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}