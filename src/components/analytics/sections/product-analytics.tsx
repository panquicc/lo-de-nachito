// src/components/analytics/sections/product-analytics.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

interface ProductAnalyticsData {
  groupBy: string
  data: Array<{
    productId: string
    productName: string
    revenue: number
    quantity: number
    cost: number
    profit: number
    rotationRate: string
    isComposite: boolean
  }>
  summary: {
    totalProducts: number
    totalRevenue: number
    totalProfit: number
    bestSellingProduct: any
    highestRevenueProduct: any
  }
}

interface ProductAnalyticsProps {
  dateRange?: DateRange
}

export function ProductAnalytics({ dateRange }: ProductAnalyticsProps) {
  const [data, setData] = useState<ProductAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dateRange?.from && dateRange.to) {
      fetchProductData()
    }
  }, [dateRange])

  const fetchProductData = async () => {
    if (!dateRange?.from || !dateRange?.to) return
    
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        groupBy: 'product',
        includeCosts: 'true'
      })

      const response = await fetch(`/api/analytics/products?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos de productos')
      }
      
      const productData = await response.json()
      setData(productData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ProductAnalyticsSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <button 
              onClick={fetchProductData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Productos</CardTitle>
          <CardDescription>
            Ventas, rentabilidad y rotación de productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay datos de ventas para el período seleccionado</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { data: products, summary } = data

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total de productos con ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Ventas totales del kiosco</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalProfit)}</div>
            <p className="text-xs text-muted-foreground">Después de costos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalRevenue > 0 ? Math.round((summary.totalProfit / summary.totalRevenue) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Porcentaje de ganancia</p>
          </CardContent>
        </Card>
      </div>

      {/* Productos más vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>
            Ranking por cantidad vendida y revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.slice(0, 10).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{product.productName}</div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{product.quantity} unidades</span>
                      <span>•</span>
                      <Badge variant={getRotationRateVariant(product.rotationRate)}>
                        {product.rotationRate}
                      </Badge>
                      {product.isComposite && (
                        <Badge variant="secondary">Compuesto</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(product.revenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(product.profit)} ganancia
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Producto Más Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.bestSellingProduct && (
              <div className="space-y-2">
                <div className="font-medium">{summary.bestSellingProduct.productName}</div>
                <div className="text-2xl font-bold">{summary.bestSellingProduct.quantity} unidades</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(summary.bestSellingProduct.revenue)} en ventas
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mayor Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.highestRevenueProduct && (
              <div className="space-y-2">
                <div className="font-medium">{summary.highestRevenueProduct.productName}</div>
                <div className="text-2xl font-bold">{formatCurrency(summary.highestRevenueProduct.revenue)}</div>
                <div className="text-sm text-muted-foreground">
                  {summary.highestRevenueProduct.quantity} unidades vendidas
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProductAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-1/2 mb-1" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-3" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function getRotationRateVariant(rate: string) {
  switch (rate) {
    case 'high': return 'default'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'outline'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount)
}