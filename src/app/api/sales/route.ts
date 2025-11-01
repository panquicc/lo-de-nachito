// src/app/api/sales/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('sales')
      .select(`
        *,
        clients (name),
        sale_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .order('created_at', { ascending: false })

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      
      query = query
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
    }

    const { data: sales, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { sale, items, bookingId } = await request.json()

    // Crear la venta
    const { data: newSale, error: saleError } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single()

    if (saleError) {
      return NextResponse.json({ error: saleError.message }, { status: 400 })
    }

    // Crear los items de venta
    const saleItems = items.map((item: any) => ({
      ...item,
      sale_id: newSale.id
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      // Rollback: eliminar la venta si hay error en los items
      await supabase.from('sales').delete().eq('id', newSale.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    // Asociar con booking si existe
    if (bookingId) {
      const { error: bookingSaleError } = await supabase
        .from('booking_sales')
        .insert([{ booking_id: bookingId, sale_id: newSale.id }])

      if (bookingSaleError) {
        console.error('Error asociando venta con turno:', bookingSaleError)
      }
    }

    // Obtener la venta completa con relaciones
    const { data: completeSale, error: completeError } = await supabase
      .from('sales')
      .select(`
        *,
        clients (name),
        sale_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq('id', newSale.id)
      .single()

    if (completeError) {
      return NextResponse.json({ error: completeError.message }, { status: 400 })
    }

    return NextResponse.json(completeSale)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}