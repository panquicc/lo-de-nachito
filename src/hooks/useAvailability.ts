// src/hooks/useAvailability.ts
import { useQuery } from '@tanstack/react-query'

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

      const params = new URLSearchParams({ courtId, date })
      const response = await fetch(`/api/availability?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar disponibilidad')
      }
      
      return response.json()
    },
    enabled: !!courtId && !!date,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}