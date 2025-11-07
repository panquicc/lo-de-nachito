// src/components/analytics/sections/stock-analytics.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react"

interface StockAnalyticsData {
  summary: {
    totalProducts: number
    totalTrackedProducts: number
    lowStockCount: number
    outOfStockCount: number
    totalInventoryValue: number
    compositeProductsNeedingAttention: number
  }
  products: Array<{
    id: string
    name: string
    stock: number
    min_stock: number
    cost_price: number
    rotation_rate: string
    track_stock: boolean
    needsRestock: boolean
    inventoryValue: number
    stockStatus: string
  }>
  alerts: {
    lowStock: Array<{
      id: string
      name: string
      currentStock: number
      minStock: number
      needed: number
    }>
    outOfStock: Array<{
      id: string
      name: string
      currentStock: number
    }>
    compositeIssues: Array<{
      id: string
      name: string
      componentsLow: Array<{
        name: string
        currentStock: number
        minStock: number
      }>
    }>
  }
  rotationAnalysis: {
    high: { count: number; inventoryValue: number }
    medium: { count: number; inventoryValue: number }
    low: { count: number; inventoryValue: number }
  }
}

export function StockAnalytics() {
  const [data, setData] = useState<StockAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/stock')
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos de stock')
      }
      
      const stockData = await response.json()
      setData(stockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <StockAnalyticsSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <button 
              onClick={fetchStockData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Stock</CardTitle>
          <CardDescription>
            Control de inventario y alertas de reposición
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay datos de stock disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { summary, alerts, rotationAnalysis } = data

  return (
    <div className="space-y-6">
      {/* Alertas Críticas */}
      {(alerts.outOfStock.length > 0 || alerts.lowStock.length > 0) && (
        <div className="space-y-3">
          {alerts.outOfStock.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alerts.outOfStock.length} productos sin stock:</strong>{' '}
                {alerts.outOfStock.map(p => p.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          {alerts.lowStock.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alerts.lowStock.length} productos con stock bajo</strong>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalInventoryValue)}</div>
            <p className="text-xs text-muted-foreground">Valor total del stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos con Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTrackedProducts}</div>
            <p className="text-xs text-muted-foreground">De {summary.totalProducts} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Necesitan reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Urgente reposición</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos con Stock Bajo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos que Necesitan Reposición</CardTitle>
            <CardDescription>
              Stock actual por debajo del mínimo establecido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.lowStock.length > 0 ? (
                alerts.lowStock.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.currentStock} / Mínimo: {product.minStock}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Faltan {product.needed}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>¡Excelente! No hay productos con stock bajo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Análisis por Rotación */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis por Rotación</CardTitle>
            <CardDescription>
              Distribución del inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Alta</Badge>
                  <span className="text-sm">{rotationAnalysis.high.count} productos</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(rotationAnalysis.high.inventoryValue)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Media</Badge>
                  <span className="text-sm">{rotationAnalysis.medium.count} productos</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(rotationAnalysis.medium.inventoryValue)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Baja</Badge>
                  <span className="text-sm">{rotationAnalysis.low.count} productos</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(rotationAnalysis.low.inventoryValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productos Compuestos con Problemas */}
      {alerts.compositeIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Compuestos con Componentes Bajos</CardTitle>
            <CardDescription>
              Estos productos necesitan atención en sus componentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.compositeIssues.map(product => (
                <div key={product.id} className="p-3 border rounded-lg">
                  <div className="font-medium mb-2">{product.name}</div>
                  <div className="space-y-2">
                    {product.componentsLow.map(component => (
                      <div key={component.name} className="flex justify-between text-sm">
                        <span>{component.name}</span>
                        <span className="text-amber-600">
                          Stock: {component.currentStock} (mín: {component.minStock})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StockAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/2 mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-3" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-3" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount)
}