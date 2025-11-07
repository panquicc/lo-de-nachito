// src/components/kiosk/KioskPOS.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, Trash2, ShoppingCart, Loader2, Zap } from 'lucide-react'
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

  const { data: products, isLoading: productsLoading, error: productsError } = useProducts()
  const { data: bookings, isLoading: bookingsLoading } = useBookings(new Date().toISOString().split('T')[0])
  const createSaleMutation = useCreateSale()

  const addToCart = (product: Product) => {
    // Verificar stock para productos normales
    if (product.track_stock && product.stock !== null && product.stock <= 0) {
      toast.warning('Producto sin stock disponible')
      return
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id)
      
      if (existingItem) {
        // Verificar stock para productos normales
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
      
      return [...currentCart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock || undefined,
        isComposite: product.is_composite
      }]
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    // Encontrar el producto original para verificar stock
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
    setCart(currentCart =>
      currentCart.filter(item => item.productId !== productId)
    )
  }

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

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
      
      // Limpiar carrito después de venta exitosa
      setCart([])
      setSelectedBooking('')
      setPaymentMethod('EFECTIVO')
      
      toast.success('Venta procesada exitosamente')
    } catch (error: any) {
      // Mostrar error específico de la API
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

  if (productsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Carrito de Venta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
          <div className="text-center text-red-600">
            Error cargando productos: {productsError.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeProducts = products?.filter(product => product.is_active) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Productos */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Productos Disponibles</span>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="secondary" className="text-xs">
                COMPUESTO
              </Badge>
              <span>•</span>
              <Badge variant="destructive" className="text-xs">
                SIN STOCK
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                  className={`h-auto p-3 flex flex-col items-center justify-center space-y-2 relative ${
                    isComposite ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                  onClick={() => addToCart(product)}
                >
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center rounded-md">
                      <span className="text-xs font-medium text-gray-500">SIN STOCK</span>
                    </div>
                  )}
                  
                  {/* Icono para productos compuestos */}
                  {isComposite && (
                    <Zap className="h-3 w-3 text-blue-500 absolute top-1 right-1" />
                  )}
                  
                  <div className="text-lg font-semibold">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-center leading-tight line-clamp-2">
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

      {/* Carrito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Carrito de Venta
            {cart.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {cart.reduce((total, item) => total + item.quantity, 0)} items
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Selector de turno */}
          <div className="space-y-3 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Asociar a turno (opcional)</label>
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="w-full p-2 border rounded-md"
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
                className="w-full p-2 border rounded-md"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          </div>

          {/* Items del carrito */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Agregá productos al carrito</p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.productId} 
                  className={`flex items-center justify-between p-3 border rounded-lg bg-white ${
                    item.isComposite ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      {item.isComposite && (
                        <Zap className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPrice(item.price)} c/u • Total: {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
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
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total y botón de checkout */}
          {cart.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold">{formatPrice(totalAmount)}</span>
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
    </div>
  )
}