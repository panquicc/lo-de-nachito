// src/components/bookings/BookingsList.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { Booking } from '@/lib/api/bookings'
import { BookingCard } from './BookingCard'

interface BookingsListProps {
  bookings: Booking[]
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  isDeleting?: boolean
}

export function BookingsList({ bookings, onEdit, onDelete, isDeleting = false }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-gray-500">
          <Calendar className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay turnos</p>
          <p className="text-sm mt-1 text-center">
            No hay reservas para los criterios seleccionados
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={onEdit}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}