// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    
    // Obtener estadísticas del día
    const [
      { count: todayBookings },
      { data: todaySales },
      { count: activeClients },
      { data: lowStockProducts }
    ] = await Promise.all([
      // Turnos de hoy
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', `${today}T00:00:00`)
        .lt('start_time', `${today}T23:59:59`),
      
      // Ventas de hoy
      supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`),
      
      // Clientes activos (con turnos este mes)
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true }),
      
      // Productos con stock bajo
      supabase
        .from('products')
        .select('*')
        .lt('stock', 10)
        .gt('stock', 0)
    ])

    const todayRevenue = todaySales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0
    const lowStockCount = lowStockProducts?.length || 0

    const stats = {
      todayBookings: todayBookings || 0,
      activeClients: activeClients || 0,
      todayRevenue,
      lowStockCount,
      totalProducts: 12 // Hardcodeado por ahora
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}