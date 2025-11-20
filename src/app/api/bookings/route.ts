// src/app/api/bookings/route.ts 
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ArgentinaDateUtils } from '@/lib/date-utils'

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

    // Transformar fechas de UTC a hora argentina
    const transformedBookings = bookings?.map(booking => ({
      ...booking,
      start_time: ArgentinaDateUtils.UTCToLocal(booking.start_time),
      end_time: ArgentinaDateUtils.UTCToLocal(booking.end_time),
      created_at: ArgentinaDateUtils.UTCToLocal(booking.created_at),
      // Campos formateados para display
      display_date: ArgentinaDateUtils.formatDate(new Date(booking.start_time)),
      display_time: ArgentinaDateUtils.formatTime(new Date(booking.start_time))
    }))

    return NextResponse.json(transformedBookings)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// Función auxiliar para verificar disponibilidad de reservas
async function checkBookingAvailability(
  supabase: any,
  courtId: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
) {
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('court_id', courtId)
    .in('status', ['PENDIENTE', 'SEÑADO', 'PAGADO'])
    .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`)

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId)
  }

  const { data: conflics, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return conflics && conflics.length > 0 ? conflics[0] : null
}

function generateRecurringDates(start: Date, end: Date, recurrence: any) {
  const dates = []
  const duration = end.getTime() - start.getTime()
  let currentStart = new Date(start)
  let count = 0

  // Limite de seguridad
  const MAX_OCCURRENCES = 50
  const limit = recurrence.occurrences ? Math.min(recurrence.occurrences, MAX_OCCURRENCES) : MAX_OCCURRENCES
  const endDateLimit = recurrence.endDate ? new Date(recurrence.endDate) : null

  while (count < limit) {
    // Verificar fecha limite
    if (endDateLimit && currentStart > endDateLimit) break

    dates.push({
      start: new Date(currentStart),
      end: new Date(currentStart.getTime() + duration)
    })

    // Avanzar fecha
    if (recurrence.frequency === 'DAILY') {
      currentStart.setDate(currentStart.getDate() + 1)
    } else if (recurrence.frequency === 'WEEKLY') {
      currentStart.setDate(currentStart.getDate() + 7)
    }

    count++
  }

  return dates
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const bookingData = await request.json()

    // Verificar disponibilidad
    if (!bookingData.court_id || !bookingData.start_time || !bookingData.end_time) {
      return NextResponse.json(
        { error: 'court_id, start_time y end_time son obligatorios' },
        { status: 400 }
      )
    }

    // Validar que las fechas sean válidas
    const startTime = new Date(bookingData.start_time)
    const endTime = new Date(bookingData.end_time)

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { error: 'Las fechas proporcionadas no son válidas' },
        { status: 400 }
      )
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'La hora de fin debe ser posterior a la hora de inicio' },
        { status: 400 }
      )
    }

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

    // Generar lista de reservas (1 o muchas)
    let bookingsToCreate = []

    if (bookingData.recurrence) {
      const dates = generateRecurringDates(startTime, endTime, bookingData.recurrence)
      bookingsToCreate = dates.map(date => ({
        ...bookingData,
        start_time: date.start.toISOString(),
        end_time: date.end.toISOString()
      }))
    } else {
      bookingsToCreate = [{
        ...bookingData,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      }]
    }

    // Verificar disponibilidad para TODAS las reservas
    for (const booking of bookingsToCreate) {
      const conflict = await checkBookingAvailability(
        supabase,
        booking.court_id,
        booking.start_time,
        booking.end_time
      )

      if (conflict) {
        const conflictStart = ArgentinaDateUtils.formatDateTime(new Date(conflict.start_time))
        const conflictEnd = ArgentinaDateUtils.formatDateTime(new Date(conflict.end_time))
        const bookingStart = ArgentinaDateUtils.formatDateTime(new Date(booking.start_time))

        return NextResponse.json(
          {
            error: 'Conflicto de disponibilidad en serie recurrente',
            conflict: {
              existing_booking: conflict,
              message: `Conflicto el ${bookingStart} con reserva existente: ${conflictStart} - ${conflictEnd}`
            }
          },
          { status: 409 }
        )
      }
    }

    // Insertar reservas
    const createdBookings = []

    for (const booking of bookingsToCreate) {
      // Transformar fechas a UTC antes de guardar
      const transformedData = {
        ...booking,
        start_time: ArgentinaDateUtils.localToUTC(new Date(booking.start_time)),
        end_time: ArgentinaDateUtils.localToUTC(new Date(booking.end_time)),
        // Asegurar valores por defecto 
        cash_amount: booking.cash_amount || 0,
        mercado_pago_amount: booking.mercado_pago_amount || 0,
        hour_price: booking.hour_price || 0,
        deposit_amount: booking.deposit_amount || 0
      }

      // Remove recurrence object before insert
      delete transformedData.recurrence

      const { data, error } = await supabase
        .from('bookings')
        .insert([transformedData])
        .select(`
          *,
          courts (name, type),
          clients (name, phone)
        `)
        .single()

      if (error) {
        // Si falla una, podríamos querer hacer rollback, pero por ahora retornamos error
        // Idealmente usaríamos una transacción RPC de Supabase
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      createdBookings.push(data)
    }

    // Retornar la primera reserva creada o la lista
    const firstBooking = createdBookings[0]
    const transformedBooking = firstBooking ? {
      ...firstBooking,
      start_time: ArgentinaDateUtils.UTCToLocal(firstBooking.start_time),
      end_time: ArgentinaDateUtils.UTCToLocal(firstBooking.end_time),
      created_at: ArgentinaDateUtils.UTCToLocal(firstBooking.created_at)
    } : null

    return NextResponse.json(transformedBooking)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error creando reserva' }, { status: 500 })
  }
}