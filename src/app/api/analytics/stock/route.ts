// src/app/api/analytics/stock/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true'
    const rotationRate = searchParams.get('rotationRate') // high, medium, low
    const trackStockOnly = searchParams.get('trackStockOnly') !== 'false' // true por defecto

    const supabase = await createClient()

    // Obtener todos los productos primero
    let query = supabase
      .from('products')
      .select(`
        *,
        product_components!parent_product_id (
          quantity_required,
          component:component_product_id (
            id,
            name,
            stock,
            min_stock,
            track_stock
          )
        )
      `)
      .order('name')

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Aplicar filtros en memoria (ya que no podemos usar raw en el cliente)
    let filteredProducts = products || []

    if (trackStockOnly) {
      filteredProducts = filteredProducts.filter(p => p.track_stock)
    }

    if (rotationRate) {
      filteredProducts = filteredProducts.filter(p => p.rotation_rate === rotationRate)
    }

    if (lowStockOnly) {
      filteredProducts = filteredProducts.filter(p => 
        p.track_stock && p.stock !== null && p.stock < p.min_stock
      )
    }

    // Calcular métricas de stock
    const stockData = calculateStockMetrics(filteredProducts)

    return NextResponse.json(stockData)
  } catch (error) {
    console.error('Error en analytics stock:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function calculateStockMetrics(products: any[]) {
  const totalProducts = products.length
  const productsWithStock = products.filter(p => p.track_stock && p.stock !== null)
  
  // Productos con stock bajo
  const lowStockProducts = productsWithStock.filter(p => p.stock < p.min_stock)
  
  // Productos sin stock
  const outOfStockProducts = productsWithStock.filter(p => p.stock <= 0)
  
  // Valor total del inventario
  const totalInventoryValue = productsWithStock.reduce((sum, p) => {
    return sum + (p.stock * (p.cost_price || 0))
  }, 0)

  // Análisis por rotación
  const rotationAnalysis = {
    high: products.filter(p => p.rotation_rate === 'high'),
    medium: products.filter(p => p.rotation_rate === 'medium'),
    low: products.filter(p => p.rotation_rate === 'low')
  }

  // Productos compuestos que necesitan atención
  const compositeProductsNeedingAttention = products.filter(p => 
    p.is_composite && p.product_components?.some((comp: any) => {
      const component = comp.component
      return component && component.track_stock && component.stock < component.min_stock
    })
  )

  return {
    summary: {
      totalProducts,
      totalTrackedProducts: productsWithStock.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalInventoryValue,
      compositeProductsNeedingAttention: compositeProductsNeedingAttention.length
    },
    products: products.map(product => ({
      ...product,
      needsRestock: product.track_stock && product.stock < product.min_stock,
      inventoryValue: (product.stock || 0) * (product.cost_price || 0),
      stockStatus: getStockStatus(product)
    })),
    alerts: {
      lowStock: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.stock,
        minStock: p.min_stock,
        needed: p.min_stock - p.stock
      })),
      outOfStock: outOfStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.stock
      })),
      compositeIssues: compositeProductsNeedingAttention.map(p => ({
        id: p.id,
        name: p.name,
        componentsLow: p.product_components?.filter((comp: any) => 
          comp.component && comp.component.track_stock && comp.component.stock < comp.component.min_stock
        ).map((comp: any) => ({
          name: comp.component.name,
          currentStock: comp.component.stock,
          minStock: comp.component.min_stock
        })) || []
      }))
    },
    rotationAnalysis: {
      high: {
        count: rotationAnalysis.high.length,
        inventoryValue: rotationAnalysis.high.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
      },
      medium: {
        count: rotationAnalysis.medium.length,
        inventoryValue: rotationAnalysis.medium.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
      },
      low: {
        count: rotationAnalysis.low.length,
        inventoryValue: rotationAnalysis.low.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0)
      }
    }
  }
}

function getStockStatus(product: any) {
  if (!product.track_stock || product.stock === null) return 'no-track'
  if (product.stock <= 0) return 'out-of-stock'
  if (product.stock < product.min_stock) return 'low'
  return 'ok'
}