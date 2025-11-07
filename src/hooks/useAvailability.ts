// src/hooks/useAvailability.ts
import { useQuery } from '@tanstack/react-query'
import { createPublicClient } from '@/lib/supabase/public-client'

interface AvailabilityParams {
  courtId?: string
  date?: string
}

interface AvailableSlot {
  start_time: string
  end_time: string
  display_time: string
}

interface AvailabilityData {
  court: any
  availableSlots: AvailableSlot[]
  date: string
}

export function useAvailability({ courtId, date }: AvailabilityParams) {
  return useQuery({
    queryKey: ['availability', courtId, date],
    queryFn: async (): Promise<AvailabilityData> => {
      if (!courtId || !date) {
        throw new Error('courtId y date son requeridos')
      }

      const supabase = createPublicClient()
      
      // Calcular rango del día completo
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      // Obtener reservas existentes
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('start_time, end_time, status')
        .eq('court_id', courtId)
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString())
        .in('status', ['PENDIENTE', 'SEÑADO', 'PAGADO'])

      if (bookingsError) {
        throw new Error(bookingsError.message)
      }

      // Obtener información de la cancha
      const { data: court, error: courtError } = await supabase
        .from('courts')
        .select('*')
        .eq('id', courtId)
        .single()

      if (courtError) {
        throw new Error(courtError.message)
      }

      // Generar slots disponibles
      const availableSlots = generateAvailableSlots(
        date,
        existingBookings || [],
        court.type
      )

      return {
        court,
        availableSlots,
        date
      }
    },
    enabled: !!courtId && !!date,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

function generateAvailableSlots(
  date: string, 
  existingBookings: any[], 
  courtType: string
) {
  const slots = []
  const startHour = 8
  const endHour = 23
  const slotDuration = 60
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`)
      const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000)
      
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