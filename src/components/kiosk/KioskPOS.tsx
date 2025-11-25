// src/components/kiosk/KioskPOS.tsx
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Loader2, Search, X, Trash2, Plus, Minus, Zap, User } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useBookings } from '@/hooks/useBookings'
import type { Booking } from '@/lib/api/bookings'
import { useCreateSale } from '@/hooks/useSales'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@/lib/api/sales'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/api/products'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { ProductGrid } from './ProductGrid'
import { ClientSelector } from './ClientSelector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from '@/components/ui/separator'

type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  stock?: number
  isComposite?: boolean
}

type FilterType = 'ALL' | 'HIGH_ROTATION' | 'COMPOSITE'

export default function KioskPOS() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedBooking, setSelectedBooking] = useState<string>('no_booking')
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO')
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL')

  const { data: products, isLoading: productsLoading, error: productsError } = useProducts()
  const { data: bookings, isLoading: bookingsLoading } = useBookings(new Date().toISOString().split('T')[0])
  const createSaleMutation = useCreateSale()

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return []

    return products.filter(product => {
      if (!product.is_active) return false

      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      let matchesFilter = true
      if (activeFilter === 'HIGH_ROTATION') {
        matchesFilter = product.rotation_rate === 'high'
      } else if (activeFilter === 'COMPOSITE') {
        matchesFilter = product.is_composite
      }

      return matchesSearch && matchesFilter
    })
  }, [products, searchQuery, activeFilter])

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

      toast.success(`${product.name} agregado`, {
        description: `Carrito: ${newCart.reduce((sum, item) => sum + item.quantity, 0)} productos`,
        duration: 1000,
        position: 'bottom-center'
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
        toast.info(`${removedItem.name} eliminado`, {
          duration: 1000,
          position: 'bottom-center'
        })
      }

      return newCart
    })
  }

  const clearCart = () => {
    if (cart.length > 0) {
      toast.info('Carrito vaciado', { position: 'bottom-center' })
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
      const isInternalConsumption = paymentMethod === 'CONSUMO_INTERNO'

      const saleData = {
        sale: {
          total_amount: isInternalConsumption ? 0 : totalAmount,
          payment_method: paymentMethod,
          client_id: selectedClientId
        },
        items: cart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: isInternalConsumption ? 0 : item.price
        })),
        bookingId: selectedBooking === 'no_booking' ? undefined : selectedBooking
      }

      await createSaleMutation.mutateAsync(saleData)

      toast.success('Venta procesada exitosamente')
      setCart([])
      setSelectedBooking('no_booking')
      setSelectedClientId(undefined)
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

  // Create a Map of product IDs to their quantities in the cart
  const cartQuantities = useMemo(() => {
    const quantities = new Map<string, number>()
    cart.forEach(item => {
      quantities.set(item.productId, item.quantity)
    })
    return quantities
  }, [cart])

  // Mini-carrito flotante para móvil
  const MobileCartFloater = () => {
    if (cart.length === 0 || showCart) return null

    return (
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 flex items-center justify-between" onClick={() => setShowCart(true)}>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-full">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{totalItems} items</p>
              <p className="text-sm text-gray-500">{formatPrice(totalAmount)}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost">Ver Carrito</Button>
        </div>
      </div>
    )
  }

  if (productsError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p className="font-semibold">Error al cargar productos</p>
            <p className="text-sm">{productsError.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4">
      <MobileCartFloater />

      {/* Main Content - Products */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <Button
              variant={activeFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('ALL')}
              className="whitespace-nowrap"
            >
              Todos
            </Button>
            <Button
              variant={activeFilter === 'HIGH_ROTATION' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('HIGH_ROTATION')}
              className="whitespace-nowrap"
            >
              <Zap className="h-3 w-3 mr-1" />
              Alta Rotación
            </Button>
            <Button
              variant={activeFilter === 'COMPOSITE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('COMPOSITE')}
              className="whitespace-nowrap"
            >
              Combos
            </Button>
          </div>
        </div>

        {/* Products Grid Area */}
        <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border bg-white shadow-sm p-4">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onAddToCart={addToCart}
              cartQuantities={cartQuantities}
            />
          )}
        </div>
      </div>

      {/* Cart Sidebar - Desktop */}
      <div className={`
        fixed inset-0 z-50 lg:static lg:z-0 
        ${showCart ? 'flex' : 'hidden lg:flex'}
        lg:w-[400px] flex-col
      `}>
        {/* Mobile Overlay */}
        <div
          className="absolute inset-0 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setShowCart(false)}
        />

        {/* Cart Content */}
        <Card className="relative w-full max-w-md ml-auto lg:max-w-none h-full flex flex-col shadow-xl lg:shadow-sm border-l-0 lg:border-l">
          <CardHeader className="border-b px-4 py-3 flex flex-row items-center justify-between bg-gray-50/50">
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
              Venta Actual
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {totalItems} items
              </Badge>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowCart(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0 flex flex-col">
            {/* Client & Booking Section */}
            <div className="p-4 space-y-4 bg-gray-50/30 border-b">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                  <User className="h-3 w-3" /> Cliente
                </label>
                <ClientSelector
                  selectedClientId={selectedClientId}
                  onClientSelect={setSelectedClientId}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase">Turno (Opcional)</label>
                <Select value={selectedBooking} onValueChange={setSelectedBooking} disabled={bookingsLoading}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue placeholder="Seleccionar turno..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_booking">Sin turno asociado</SelectItem>
                    {bookings?.map((booking: Booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.courts?.name} - {new Date(booking.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400 flex flex-col items-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <p>Tu carrito está vacío</p>
                  <p className="text-sm">Agrega productos para comenzar</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col gap-2 p-3 rounded-lg border bg-white shadow-sm hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-sm line-clamp-2">{item.name}</div>
                      <div className="font-bold text-sm whitespace-nowrap">{formatPrice(item.price * item.quantity)}</div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatPrice(item.price)} c/u</span>

                      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded-sm transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-sm transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          {/* Cart Footer */}
          <div className="border-t p-4 bg-gray-50/50 space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase">Método de Pago</label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger className="h-9 text-sm bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    <SelectItem value="CONSUMO_INTERNO">Consumo Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-500">Total a Pagar</span>
                <div className="flex flex-col items-end">
                  {paymentMethod === 'CONSUMO_INTERNO' && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(totalAmount)}</span>
                  )}
                  <span className="text-2xl font-bold text-gray-900">
                    {paymentMethod === 'CONSUMO_INTERNO' ? formatPrice(0) : formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="col-span-1 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                  title="Vaciar carrito"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  className="col-span-3 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || createSaleMutation.isPending}
                >
                  {createSaleMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Cobrar
                      <ShoppingCart className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}