// src/app/api/availability/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courtId = searchParams.get('courtId')
    const date = searchParams.get('date') // YYYY-MM-DD
    
    if (!courtId || !date) {
      return NextResponse.json(
        { error: 'courtId y date son requeridos' }, 
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Calcular rango del día completo
    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)
    
    // Obtener reservas existentes para esa cancha y fecha
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time, status')
      .eq('court_id', courtId)
      .gte('start_time', startDate.toISOString())
      .lt('start_time', endDate.toISOString())
      .in('status', ['PENDIENTE', 'SEÑADO', 'PAGADO'])

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 400 })
    }

    // Obtener información de la cancha
    const { data: court, error: courtError } = await supabase
      .from('courts')
      .select('*')
      .eq('id', courtId)
      .single()

    if (courtError) {
      return NextResponse.json({ error: courtError.message }, { status: 400 })
    }

    // Generar slots disponibles (ejemplo: de 8:00 a 23:00, 1 hora cada slot)
    const availableSlots = generateAvailableSlots(
      date,
      existingBookings || [],
      court.type
    )

    return NextResponse.json({
      court,
      availableSlots,
      date
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

function generateAvailableSlots(
  date: string, 
  existingBookings: any[], 
  courtType: string
) {
  const slots = []
  const startHour = 8 // 8:00 AM
  const endHour = 23 // 11:00 PM
  const slotDuration = 60 // minutos
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`)
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000)
      
      // Verificar si el slot está disponible
      const isAvailable = !existingBookings.some(booking => {
        const bookingStart = new Date(booking.start_time)
        const bookingEnd = new Date(booking.end_time)
        return slotStart < bookingEnd && slotEnd > bookingStart
      })
      
      if (isAvailable) {
        slots.push({
          start_time: slotStart.toISOString(),
          end_time: slotEnd.toISOString(),
          display_time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} - ${slotEnd.getHours().toString().padStart(2, '0')}:${slotEnd.getMinutes().toString().padStart(2, '0')}`
        })
      }
    }
  }
  
  return slots
}