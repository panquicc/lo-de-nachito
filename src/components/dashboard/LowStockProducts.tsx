// src/components/dashboard/LowStockProducts.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package, Loader2 } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { Product } from '@/lib/api/products'

// Configuración de niveles de stock
const STOCK_LEVELS = {
  CRITICAL: 5,    // Menos de 5 unidades = Crítico
  LOW: 10,        // Menos de 10 unidades = Bajo
  MIN_STOCK: 15   // Stock mínimo recomendado
}

export default function LowStockProducts() {
  const { data: products, isLoading, error } = useProducts()

  const getStockLevel = (product: Product) => {
    // Si el producto está inactivo, no mostrar
    if (!product.is_active) return null

    // Si el stock es null (ilimitado), no mostrar
    if (product.stock === null) return null

    // Si no tiene stock definido, no mostrar
    if (product.stock === undefined) return null

    // Determinar nivel de stock
    if (product.stock === 0) return 'out-of-stock'
    if (product.stock <= STOCK_LEVELS.CRITICAL) return 'critical'
    if (product.stock <= STOCK_LEVELS.LOW) return 'low'
    if (product.stock <= STOCK_LEVELS.MIN_STOCK) return 'warning'
    
    return null // Stock suficiente
  }

  const stockLevelColors = {
    'out-of-stock': 'bg-red-100 text-red-800 border-red-200',
    'critical': 'bg-red-100 text-red-800 border-red-200',
    'low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'warning': 'bg-orange-100 text-orange-800 border-orange-200'
  }

  const stockLevelLabels = {
    'out-of-stock': 'Sin Stock',
    'critical': 'Crítico',
    'low': 'Bajo',
    'warning': 'Atención'
  }

  const stockLevelIcons = {
    'out-of-stock': '🔴',
    'critical': '🔴',
    'low': '🟡',
    'warning': '🟠'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  // Filtrar productos con stock bajo
  const lowStockProducts = products?.filter(product => {
    const stockLevel = getStockLevel(product)
    return stockLevel !== null
  }) || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Productos con Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Productos con Stock Bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            Error cargando productos: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Productos con Stock Bajo
          </span>
          {lowStockProducts.length > 0 && (
            <Badge variant="destructive">
              {lowStockProducts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-green-300" />
            <p className="font-medium text-green-600">¡Excelente!</p>
            <p className="text-sm">Todos los productos tienen stock suficiente</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {lowStockProducts.map((product) => {
                const stockLevel = getStockLevel(product) as keyof typeof stockLevelColors
                
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium flex items-center">
                        <span className="mr-2">{stockLevelIcons[stockLevel]}</span>
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock actual: {product.stock} unidades
                        {stockLevel === 'out-of-stock' && (
                          <span className="text-red-600 font-medium ml-2">• AGOTADO</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="secondary" 
                        className={stockLevelColors[stockLevel]}
                      >
                        {stockLevelLabels[stockLevel]}
                      </Badge>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatPrice(product.price)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Resumen y recomendación */}
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-yellow-800">
                      Recomendación de stock
                    </span>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      <li>• <strong>Crítico:</strong> Menos de {STOCK_LEVELS.CRITICAL} unidades - Reponer urgentemente</li>
                      <li>• <strong>Bajo:</strong> Menos de {STOCK_LEVELS.LOW} unidades - Considerar reposición</li>
                      <li>• <strong>Atención:</strong> Menos de {STOCK_LEVELS.MIN_STOCK} unidades - Monitorear</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-bold text-red-700">
                    {lowStockProducts.filter(p => getStockLevel(p) === 'out-of-stock' || getStockLevel(p) === 'critical').length}
                  </div>
                  <div className="text-red-600">Críticos</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-bold text-yellow-700">
                    {lowStockProducts.filter(p => getStockLevel(p) === 'low').length}
                  </div>
                  <div className="text-yellow-600">Bajos</div>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <div className="font-bold text-orange-700">
                    {lowStockProducts.filter(p => getStockLevel(p) === 'warning').length}
                  </div>
                  <div className="text-orange-600">Atención</div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}