// src/app/api/bookings/route.ts - ACTUALIZADO
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const courtId = searchParams.get('courtId')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        courts (name, type),
        clients (name, phone)
      `)
      .order('start_time')

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      
      query = query
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
    }

    if (courtId) {
      query = query.eq('court_id', courtId)
    }

    const { data: bookings, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const bookingData = await request.json()

    // Validar que los montos sean consistentes
    if (bookingData.payment_method === 'EFECTIVO' && bookingData.cash_amount !== bookingData.amount) {
      return NextResponse.json(
        { error: 'Para pago en efectivo, el monto en efectivo debe ser igual al total' },
        { status: 400 }
      )
    }

    if (bookingData.payment_method === 'MERCADO_PAGO' && bookingData.mercado_pago_amount !== bookingData.amount) {
      return NextResponse.json(
        { error: 'Para pago con Mercado Pago, el monto de MP debe ser igual al total' },
        { status: 400 }
      )
    }

    if (bookingData.payment_method === 'MIXTO' && 
        (bookingData.cash_amount + bookingData.mercado_pago_amount) !== bookingData.amount) {
      return NextResponse.json(
        { error: 'Para pago mixto, la suma de efectivo y MP debe ser igual al total' },
        { status: 400 }
      )
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        // Asegurar valores por defecto
        cash_amount: bookingData.cash_amount || 0,
        mercado_pago_amount: bookingData.mercado_pago_amount || 0,
        hour_price: bookingData.hour_price || 0,
        deposit_amount: bookingData.deposit_amount || 0
      }])
      .select(`
        *,
        courts (name, type),
        clients (name, phone)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}