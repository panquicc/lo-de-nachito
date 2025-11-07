// src/app/api/analytics/bookings/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const courtType = searchParams.get('courtType')
    const groupBy = searchParams.get('groupBy') || 'day' // day, court, hour

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Obtener bookings con información de canchas
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        *,
        courts (id, name, type),
        clients (name, phone)
      `)
      .gte('start_time', `${startDate}T00:00:00`)
      .lte('start_time', `${endDate}T23:59:59`)
      .in('status', ['PAGADO', 'SEÑADO'])

    if (courtType) {
      bookingsQuery = bookingsQuery.eq('courts.type', courtType)
    }

    const { data: bookings, error } = await bookingsQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Procesar datos según el grupo
    const analyticsData = groupBy === 'court' 
      ? analyzeByCourt(bookings || [])
      : groupBy === 'hour'
      ? analyzeByHour(bookings || [])
      : analyzeByDay(bookings || [])

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error en analytics bookings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function analyzeByDay(bookings: any[]) {
  const dailyMap = new Map()

  bookings.forEach(booking => {
    const date = new Date(booking.start_time).toISOString().split('T')[0]
    const existing = dailyMap.get(date) || { 
      date, 
      revenue: 0, 
      bookings: 0, 
      totalHours: 0,
      byCourtType: {},
      byPaymentMethod: {}
    }

    // Métricas básicas
    existing.revenue += booking.amount
    existing.bookings += 1
    
    // Calcular horas
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    existing.totalHours += hours

    // Por tipo de cancha
    const courtType = booking.courts?.type || 'Unknown'
    existing.byCourtType[courtType] = (existing.byCourtType[courtType] || 0) + 1

    // Por método de pago
    const paymentMethod = booking.payment_method
    existing.byPaymentMethod[paymentMethod] = (existing.byPaymentMethod[paymentMethod] || 0) + booking.amount

    dailyMap.set(date, existing)
  })

  return {
    groupBy: 'day',
    data: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    summary: {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
      averageRevenuePerBooking: bookings.length > 0 ? 
        bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length : 0,
      mostPopularCourtType: getMostPopularCourtType(bookings)
    }
  }
}

function analyzeByCourt(bookings: any[]) {
  const courtMap = new Map()

  bookings.forEach(booking => {
    const courtId = booking.court_id
    const courtName = booking.courts?.name || 'Unknown'
    const courtType = booking.courts?.type || 'Unknown'

    const existing = courtMap.get(courtId) || {
      courtId,
      courtName,
      courtType,
      revenue: 0,
      bookings: 0,
      totalHours: 0,
      byHour: {},
      byPaymentMethod: {}
    }

    existing.revenue += booking.amount
    existing.bookings += 1

    // Calcular horas
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    existing.totalHours += hours

    // Por hora del día
    const hour = start.getHours()
    existing.byHour[hour] = (existing.byHour[hour] || 0) + 1

    // Por método de pago
    const paymentMethod = booking.payment_method
    existing.byPaymentMethod[paymentMethod] = (existing.byPaymentMethod[paymentMethod] || 0) + booking.amount

    courtMap.set(courtId, existing)
  })

  return {
    groupBy: 'court',
    data: Array.from(courtMap.values()),
    summary: {
      totalCourts: courtMap.size,
      mostBookedCourt: getMostBookedCourt(Array.from(courtMap.values())),
      highestRevenueCourt: getHighestRevenueCourt(Array.from(courtMap.values()))
    }
  }
}

function analyzeByHour(bookings: any[]) {
  const hourMap = new Map()

  // Inicializar todas las horas (8:00 - 23:00)
  for (let hour = 8; hour < 24; hour++) {
    hourMap.set(hour, {
      hour,
      display: `${hour}:00`,
      bookings: 0,
      revenue: 0,
      byCourtType: {}
    })
  }

  bookings.forEach(booking => {
    const start = new Date(booking.start_time)
    const hour = start.getHours()

    if (hour >= 8 && hour < 24) {
      const existing = hourMap.get(hour)!
      existing.bookings += 1
      existing.revenue += booking.amount

      // Por tipo de cancha
      const courtType = booking.courts?.type || 'Unknown'
      existing.byCourtType[courtType] = (existing.byCourtType[courtType] || 0) + 1

      hourMap.set(hour, existing)
    }
  })

  return {
    groupBy: 'hour',
    data: Array.from(hourMap.values()),
    peakHours: getPeakHours(Array.from(hourMap.values()))
  }
}

// Funciones auxiliares
function getMostPopularCourtType(bookings: any[]) {
  const typeCount = bookings.reduce((acc: any, booking) => {
    const type = booking.courts?.type || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  return Object.entries(typeCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'
}

function getMostBookedCourt(courts: any[]) {
  return courts.sort((a, b) => b.bookings - a.bookings)[0] || null
}

function getHighestRevenueCourt(courts: any[]) {
  return courts.sort((a, b) => b.revenue - a.revenue)[0] || null
}

function getPeakHours(hours: any[]) {
  const sortedByBookings = [...hours].sort((a, b) => b.bookings - a.bookings)
  return sortedByBookings.slice(0, 3) // Top 3 horas pico
}