// src/hooks/useBookingValidation.ts
import { useState } from 'react'
import { ArgentinaDateUtils } from '@/lib/date-utils'
import { createPublicClient } from '@/lib/supabase/public-client'

interface BookingConflict {
  isConflict: boolean
  conflictingBooking?: any
  message?: string
}

export function useBookingValidation() {
  const [isChecking, setIsChecking] = useState(false)

  const checkAvailability = async (
    courtId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflict> => {
    if (!courtId || !startTime || !endTime) {
      return { isConflict: false }
    }

    setIsChecking(true)
    try {
      const supabase = createPublicClient()

      // Buscar reservas que se superpongan
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('court_id', courtId)
        .in('status', ['PENDIENTE', 'SEÑADO', 'PAGADO'])
        .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`)

      // Excluir la reserva actual si estamos editando
      if (excludeBookingId) {
        query = query.neq('id', excludeBookingId)
      }

      const { data: conflicts, error } = await query

      if (error) {
        console.error('Error checking availability:', error)
        return { isConflict: false }
      }

      if (conflicts && conflicts.length > 0) {
        return {
          isConflict: true,
          conflictingBooking: conflicts[0],
          message: `La cancha ya está reservada de ${ArgentinaDateUtils.formatTime(new Date(conflicts[0].start_time))
            } a ${ArgentinaDateUtils.formatTime(new Date(conflicts[0].end_time))
            }`
        }
      }

      return { isConflict: false }
    } catch (error) {
      console.error('Error checking availability:', error)
      return { isConflict: false }
    } finally {
      setIsChecking(false)
    }
  }

  return { checkAvailability, isChecking }
}