// src/app/dashboard/bookings/page.tsx
import BookingsCalendar from '@/components/bookings/BookingsCalendar'
import BookingDialog from '@/components/bookings/BookingDialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BookingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
          <p className="text-gray-600 mt-2">Administra las reservas de las canchas</p>
        </div>
        
        <BookingDialog variant="create" />
      </div>

      <BookingsCalendar />
    </div>
  )
}