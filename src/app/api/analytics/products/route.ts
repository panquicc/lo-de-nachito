// src/app/api/analytics/products/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') || 'product' // product, day, category
    const includeCosts = searchParams.get('includeCosts') === 'true'

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Obtener ventas con items y productos
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        created_at,
        sale_items (
          quantity,
          unit_price,
          products (
            id,
            name,
            cost_price,
            rotation_rate,
            is_composite
          )
        )
      `)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 400 })
    }

    // Procesar datos de productos
    const productData = processProductData(sales || [], groupBy, includeCosts)

    return NextResponse.json(productData)
  } catch (error) {
    console.error('Error en analytics products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function processProductData(sales: any[], groupBy: string, includeCosts: boolean) {
  const productMap = new Map()
  let allSaleItems: any[] = []

  // Recolectar todos los items de venta
  sales.forEach(sale => {
    if (sale.sale_items && sale.sale_items.length > 0) {
      sale.sale_items.forEach((item: any) => {
        allSaleItems.push({
          ...item,
          sale_date: sale.created_at
        })
      })
    }
  })

  if (groupBy === 'product') {
    // Agrupar por producto
    allSaleItems.forEach(item => {
      const product = item.products
      if (!product) return

      const productId = product.id
      const existing = productMap.get(productId) || {
        productId,
        productName: product.name,
        revenue: 0,
        quantity: 0,
        cost: 0,
        profit: 0,
        rotationRate: product.rotation_rate,
        isComposite: product.is_composite
      }

      const itemRevenue = item.quantity * item.unit_price
      const itemCost = includeCosts ? (product.cost_price || 0) * item.quantity : 0

      existing.revenue += itemRevenue
      existing.quantity += item.quantity
      existing.cost += itemCost
      existing.profit += (itemRevenue - itemCost)

      productMap.set(productId, existing)
    })

    const productsArray = Array.from(productMap.values())
    
    return {
      groupBy: 'product',
      data: productsArray,
      summary: {
        totalProducts: productsArray.length,
        totalRevenue: productsArray.reduce((sum, p) => sum + p.revenue, 0),
        totalProfit: productsArray.reduce((sum, p) => sum + p.profit, 0),
        bestSellingProduct: productsArray.sort((a, b) => b.quantity - a.quantity)[0],
        highestRevenueProduct: productsArray.sort((a, b) => b.revenue - a.revenue)[0]
      }
    }
  } else if (groupBy === 'day') {
    // Agrupar por día
    const dailyMap = new Map()

    allSaleItems.forEach(item => {
      const date = new Date(item.sale_date).toISOString().split('T')[0]
      const existing = dailyMap.get(date) || {
        date,
        revenue: 0,
        quantity: 0,
        transactions: 0,
        averageTicket: 0
      }

      existing.revenue += item.quantity * item.unit_price
      existing.quantity += item.quantity
      existing.transactions += 1

      dailyMap.set(date, existing)
    })

    // Calcular ticket promedio
    Array.from(dailyMap.values()).forEach(day => {
      day.averageTicket = day.transactions > 0 ? day.revenue / day.transactions : 0
    })

    return {
      groupBy: 'day',
      data: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
    }
  }

  return { groupBy, data: [] }
}