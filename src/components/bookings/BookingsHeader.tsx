// src/components/bookings/BookingsHeader.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Calendar, List, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type ViewMode = 'list' | 'calendar'

interface BookingsHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onBookingSuccess: () => void
  onNewBooking: () => void
}

export function BookingsHeader({ viewMode, onViewModeChange, onNewBooking }: BookingsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Botón volver - arriba en móvil */}
      <Button asChild variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
        <Link href="/dashboard" className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Panel
        </Link>
      </Button>

      {/* Título - centrado */}
      <div className="order-1 sm:order-2 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra las reservas de las canchas</p>
      </div>

      {/* Controles de vista y nuevo turno */}
      <div className="flex items-center justify-between sm:justify-end space-x-2 order-3 sm:order-3 w-full sm:w-auto">
        {/* Selector de vista */}
        <div className="flex border rounded-lg p-1 bg-gray-100">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="h-8 px-2 sm:px-3"
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline ml-1 sm:ml-2">Lista</span>
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('calendar')}
            className="h-8 px-2 sm:px-3"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline ml-1 sm:ml-2">Calendario</span>
          </Button>
        </div>

        {/* Botón nuevo turno */}
        <Button onClick={onNewBooking} size="sm" className="h-8 sm:h-10 flex-1 sm:flex-initial">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">Nuevo</span>
        </Button>
      </div>
    </div>
  )
}