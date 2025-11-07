// src/app/api/analytics/financial/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const courtType = searchParams.get('courtType')
    const paymentMethod = searchParams.get('paymentMethod')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Obtener ingresos por bookings
    let bookingsQuery = supabase
      .from('bookings')
      .select('amount, payment_method, cash_amount, mercado_pago_amount, hour_price, deposit_amount, created_at, courts(type)')
      .gte('start_time', `${startDate}T00:00:00`)
      .lte('start_time', `${endDate}T23:59:59`)
      .in('status', ['PAGADO', 'SEÑADO'])

    if (courtType) {
      bookingsQuery = bookingsQuery.eq('courts.type', courtType)
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 400 })
    }

    // 2. Obtener ingresos por ventas de productos
    let salesQuery = supabase
      .from('sales')
      .select('total_amount, payment_method, created_at, sale_items(quantity, unit_price, products(cost_price))')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)

    if (paymentMethod) {
      salesQuery = salesQuery.eq('payment_method', paymentMethod)
    }

    const { data: sales, error: salesError } = await salesQuery

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 400 })
    }

    // 3. Calcular métricas financieras
    const financialData = calculateFinancialMetrics(bookings || [], sales || [])

    return NextResponse.json(financialData)
  } catch (error) {
    console.error('Error en analytics financial:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function calculateFinancialMetrics(bookings: any[], sales: any[]) {
  // Ingresos por bookings
  const bookingRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0)
  
  // Ingresos por método de pago en bookings
  const bookingRevenueByMethod = bookings.reduce((acc: any, booking) => {
    const method = booking.payment_method
    acc[method] = (acc[method] || 0) + booking.amount
    return acc
  }, {})

  // Ingresos por ventas
  const productRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  
  // Costos de productos vendidos
  const productCosts = sales.reduce((sum, sale) => {
    const saleCost = sale.sale_items?.reduce((itemSum: number, item: any) => {
      const costPrice = item.products?.cost_price || 0
      return itemSum + (costPrice * item.quantity)
    }, 0) || 0
    return sum + saleCost
  }, 0)

  // Ingresos totales
  const totalRevenue = bookingRevenue + productRevenue

  // Métricas por día para el gráfico
  const dailyBreakdown = calculateDailyBreakdown(bookings, sales, productCosts)

  return {
    summary: {
      totalRevenue,
      bookingRevenue,
      productRevenue,
      productCosts,
      netProfit: totalRevenue - productCosts,
      totalBookings: bookings.length,
      totalSales: sales.length
    },
    byPaymentMethod: {
      ...bookingRevenueByMethod,
      // Agregar métodos de pago de ventas
      ...sales.reduce((acc: any, sale) => {
        const method = sale.payment_method
        acc[method] = (acc[method] || 0) + sale.total_amount
        return acc
      }, {})
    },
    dailyBreakdown,
    period: {
      start: bookings[0]?.created_at || sales[0]?.created_at,
      end: bookings[bookings.length - 1]?.created_at || sales[sales.length - 1]?.created_at
    }
  }
}

function calculateDailyBreakdown(bookings: any[], sales: any[], totalCosts: number) {
  const dailyMap = new Map()

  // Procesar bookings por día
  bookings.forEach(booking => {
    const date = new Date(booking.created_at).toISOString().split('T')[0]
    const existing = dailyMap.get(date) || { date, revenue: 0, bookings: 0, salesCount: 0, costs: 0 }
    existing.revenue += booking.amount
    existing.bookings += 1
    dailyMap.set(date, existing)
  })

  // Procesar ventas por día y distribuir costos proporcionalmente
  const totalProductRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  
  sales.forEach(sale => {
    const date = new Date(sale.created_at).toISOString().split('T')[0]
    const existing = dailyMap.get(date) || { date, revenue: 0, bookings: 0, salesCount: 0, costs: 0 }
    existing.revenue += sale.total_amount
    existing.salesCount += 1
    
    // Distribuir costos proporcionalmente al revenue de cada día
    if (totalProductRevenue > 0) {
      const revenueShare = sale.total_amount / totalProductRevenue
      existing.costs += totalCosts * revenueShare
    }
    
    dailyMap.set(date, existing)
  })

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}