// src/components/bookings/BookingsFilters.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Search, Filter, X } from 'lucide-react'
import { Court } from '@/lib/api/courts'
import { BookingStatus } from '@/lib/api/bookings'
import { useMobile } from '@/hooks/useMobile'

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
  const [filtersOpen, setFiltersOpen] = useState(false)
  const isMobile = useMobile()

  // Contador de filtros activos (excluyendo "all" y búsqueda vacía)
  const activeFiltersCount = [
    dateFilter !== 'all',
    courtFilter !== 'all', 
    statusFilter !== 'all',
    searchTerm.length > 0
  ].filter(Boolean).length

  const filtersContent = (
    <div className="space-y-4">
      {/* Filtro por fecha */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Fecha</label>
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
      </div>

      {/* Filtro por cancha */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Cancha</label>
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
      </div>

      {/* Filtro por estado */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
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
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Búsqueda y botón filtros */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cliente o cancha..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <DrawerTitle className="flex items-center justify-between">
                      Filtros
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiltersOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4">
                    {filtersContent}
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {bookingsCount} turno{bookingsCount !== 1 ? 's' : ''}
              </Badge>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDateFilterChange('all')
                    onCourtFilterChange('all')
                    onStatusFilterChange('all')
                    onSearchChange('')
                  }}
                  className="text-xs text-gray-500"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Versión desktop
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
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {bookingsCount} turno{bookingsCount !== 1 ? 's' : ''}
            </Badge>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDateFilterChange('all')
                  onCourtFilterChange('all')
                  onStatusFilterChange('all')
                  onSearchChange('')
                }}
                className="text-xs text-gray-500"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}