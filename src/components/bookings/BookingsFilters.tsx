// src/components/bookings/BookingsFilters.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { Court } from '@/lib/api/courts'
import { BookingStatus } from '@/lib/api/bookings'

type DateFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'all'

interface BookingsFiltersProps {
  courts: Court[] | undefined
  bookingsCount: number
  searchTerm: string
  onSearchChange: (term: string) => void
  dateFilter: DateFilter
  onDateFilterChange: (filter: DateFilter) => void
  courtFilter: string
  onCourtFilterChange: (courtId: string) => void
  statusFilter: BookingStatus | 'all'
  onStatusFilterChange: (status: BookingStatus | 'all') => void
}

export function BookingsFilters({
  courts,
  bookingsCount,
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  courtFilter,
  onCourtFilterChange,
  statusFilter,
  onStatusFilterChange
}: BookingsFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar cliente o cancha..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por fecha */}
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="tomorrow">Mañana</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por cancha */}
          <Select value={courtFilter} onValueChange={onCourtFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las canchas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las canchas</SelectItem>
              {courts?.map((court) => (
                <SelectItem key={court.id} value={court.id}>
                  {court.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por estado */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="SEÑADO">Señado</SelectItem>
              <SelectItem value="PAGADO">Pagado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          {/* Contador de resultados */}
          <div className="flex items-center justify-end">
            <Badge variant="secondary">
              {bookingsCount} turno{bookingsCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}