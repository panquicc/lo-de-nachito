// src/components/bookings/BookingsHeader.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Calendar, List, Plus } from 'lucide-react'
import BookingDialog from './BookingDialog'
import Link from 'next/link'

type ViewMode = 'list' | 'calendar'

interface BookingsHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onBookingSuccess: () => void
  onNewBooking: () => void
}

export function BookingsHeader({ viewMode, onViewModeChange, onBookingSuccess, onNewBooking }: BookingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button asChild>
        <Link href="/dashboard">
          Volver al Panel
        </Link>
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
        <p className="text-gray-600 mt-2">Administra las reservas de las canchas</p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4 mr-2" />
          Lista
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('calendar')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendario
        </Button>

        <Button onClick={onNewBooking}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Turno
        </Button>
        
      </div>
    </div>
  )
}