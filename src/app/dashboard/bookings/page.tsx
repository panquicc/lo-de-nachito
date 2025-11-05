// src/app/dashboard/bookings/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Calendar } from 'lucide-react'
import { useBookings } from '@/hooks/useBookings'
import { useCourts } from '@/hooks/useCourts'
import { useDeleteBooking } from '@/hooks/useBookings'
import { Booking, BookingStatus } from '@/lib/api/bookings'
import { BookingsHeader } from '@/components/bookings/BookingsHeader'
import { BookingsFilters } from '@/components/bookings/BookingsFilters'
import { BookingsList } from '@/components/bookings/BookingsList'
import { CalendarView } from '@/components/bookings/CalendarView'
import BookingDialog from '@/components/bookings/BookingDialog'

type ViewMode = 'list' | 'calendar'
type DateFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'all'

export default function BookingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [courtFilter, setCourtFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const { data: courts } = useCourts()
  
  const getFilterDate = () => {
    const today = new Date()
    switch (dateFilter) {
      case 'today':
        return today.toISOString().split('T')[0]
      case 'tomorrow':
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
      case 'week':
        return undefined
      case 'month':
        return undefined
      default:
        return undefined
    }
  }

  const filterDate = getFilterDate()
  const { data: bookings, isLoading, error, refetch } = useBookings(
    dateFilter === 'all' ? undefined : filterDate,
    courtFilter === 'all' ? undefined : courtFilter
  )

  const deleteBookingMutation = useDeleteBooking()

  const filteredBookings = bookings?.filter(booking => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false
    }

    if (courtFilter !== 'all' && booking.court_id !== courtFilter) {
      return false
    }

    if (searchTerm) {
      const clientName = booking.clients?.name?.toLowerCase() || ''
      const courtName = booking.courts?.name?.toLowerCase() || ''
      const searchLower = searchTerm.toLowerCase()
      
      return clientName.includes(searchLower) || courtName.includes(searchLower)
    }

    return true
  }) || []

  const handleDelete = async (booking: Booking) => {
    if (!confirm(`¿Estás seguro de eliminar el turno de ${booking.clients?.name || 'Cliente ocasional'}?`)) {
      return
    }

    try {
      await deleteBookingMutation.mutateAsync(booking.id)
      refetch()
    } catch (error) {
      alert('Error al eliminar turno: ' + (error as Error).message)
    }
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
  }

  const handleSuccess = () => {
    setEditingBooking(null)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <BookingsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBookingSuccess={handleSuccess}
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando turnos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <BookingsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBookingSuccess={handleSuccess}
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 py-8">
              Error cargando turnos: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <BookingsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBookingSuccess={handleSuccess}
      />

      <BookingsFilters
        courts={courts}
        bookingsCount={filteredBookings.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        courtFilter={courtFilter}
        onCourtFilterChange={setCourtFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {viewMode === 'list' ? (
        <BookingsList
          bookings={filteredBookings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteBookingMutation.isPending}
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No hay turnos para mostrar</p>
                <p className="text-sm mt-1">
                  {searchTerm || courtFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Prueba ajustar los filtros' 
                    : 'No hay reservas en el calendario'
                  }
                </p>
              </div>
            ) : (
              <CalendarView bookings={filteredBookings} />
            )}
          </CardContent>
        </Card>
      )}

      {editingBooking && (
        <BookingDialog
          booking={editingBooking}
          variant="edit"
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}