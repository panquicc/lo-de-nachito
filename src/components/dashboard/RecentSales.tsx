// src/components/dashboard/RecentSales.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSales } from '@/hooks/useSales'
import { Loader2, Receipt } from 'lucide-react'

const paymentMethodColors = {
  EFECTIVO: 'bg-green-100 text-green-800 border-green-200',
  TARJETA: 'bg-blue-100 text-blue-800 border-blue-200',
  TRANSFERENCIA: 'bg-purple-100 text-purple-800 border-purple-200'
}

const paymentMethodLabels = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia'
}

export default function RecentSales() {
  // Obtener ventas del día actual
  const today = new Date().toISOString().split('T')[0]
  const { data: sales, isLoading, error } = useSales(today)

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            Error cargando ventas: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentSales = sales?.slice(0, 10) || [] // Mostrar hasta 10 ventas
  const totalToday = sales?.reduce((total, sale) => total + sale.total_amount, 0) || 0

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const getItemsCount = (sale: any) => {
    return sale.sale_items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0
  }

  const getClientName = (sale: any) => {
    return sale.clients?.name || 'Cliente ocasional'
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Ventas Recientes</span>
          <Badge variant="secondary">
            {recentSales.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {recentSales.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
            <Receipt className="h-12 w-12 mb-2 text-gray-300" />
            <p>No hay ventas hoy</p>
          </div>
        ) : (
          <>
            {/* Lista de ventas con scroll */}
            <div className="flex-1 overflow-y-auto px-4 pb-3 max-h-64"> {/* Altura máxima de ~256px */}
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" title={getClientName(sale)}>
                        {getClientName(sale)}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {getItemsCount(sale)} producto{getItemsCount(sale) !== 1 ? 's' : ''} • {formatTime(sale.created_at)}
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-semibold text-sm whitespace-nowrap">
                        {formatAmount(sale.total_amount)}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs whitespace-nowrap ${paymentMethodColors[sale.payment_method as keyof typeof paymentMethodColors]}`}
                      >
                        {paymentMethodLabels[sale.payment_method as keyof typeof paymentMethodLabels]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Total del día - Siempre visible */}
            <div className="flex-shrink-0 border-t p-4 bg-gray-50/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Total del día:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatAmount(totalToday)}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}