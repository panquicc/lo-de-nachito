// src/app/dashboard/bookings/page.tsx
'use client'

import { BookingsFilters } from '@/components/bookings/BookingsFilters'
import { BookingsHeader } from '@/components/bookings/BookingsHeader'
import { CalendarView } from '@/components/bookings/CalendarView'
import { BookingsList } from '@/components/bookings/BookingsList'
import BookingDialog from '@/components/bookings/BookingDialog'
import { Booking, BookingStatus } from '@/lib/api/bookings'
import { Card, CardContent } from '@/components/ui/card'
import { useDeleteBooking } from '@/hooks/useBookings'
import { useBookings } from '@/hooks/useBookings'
import { Loader2, Calendar } from 'lucide-react'
import { useCourts } from '@/hooks/useCourts'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type ViewMode = 'list' | 'calendar'
type DateFilter = 'today' | 'tomorrow' | 'week' | 'month' | 'all'

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [courtFilter, setCourtFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleNewBooking = () => {
    setIsCreateDialogOpen(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false)
    toast.success('Turno creado correctamente')
    refetch()
  }

  const handleDelete = async (booking: Booking) => {
    const clientName = booking.clients?.name || 'Cliente ocasional'

    toast.custom((t) => (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm w-full">
        <div className="flex flex-col space-y-3">
          <div className="font-medium text-gray-900">
            ¿Eliminar turno?
          </div>
          <div className="text-sm text-gray-600">
            ¿Estás seguro de eliminar el turno de {clientName}?
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.dismiss(t)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                toast.dismiss(t)
                try {
                  await deleteBookingMutation.mutateAsync(booking.id)
                  toast.success('Turno eliminado correctamente')
                  refetch()
                } catch (error) {
                  toast.error('Error al eliminar turno: ' + (error as Error).message)
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    ), {
      duration: 10000,
    })
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
  }

  const handleSuccess = () => {
    setEditingBooking(null)
    refetch()
  }

  const handleBookingClick = (booking: Booking) => {
    setEditingBooking(booking)
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <BookingsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewBooking={handleNewBooking}
          onBookingSuccess={handleSuccess}
        />
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Cargando turnos...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    toast.error('Error cargando turnos: ' + error.message)
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <BookingsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBookingSuccess={handleSuccess}
          onNewBooking={handleNewBooking}
        />
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center text-red-600 py-8 text-sm sm:text-base">
              Error cargando turnos: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <BookingsHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBookingSuccess={handleSuccess}
        onNewBooking={handleNewBooking}
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
          <CardContent className="p-3 sm:p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <p className="text-base sm:text-lg font-medium">No hay turnos para mostrar</p>
                <p className="text-xs sm:text-sm mt-1">
                  {searchTerm || courtFilter !== 'all' || statusFilter !== 'all'
                    ? 'Prueba ajustar los filtros'
                    : 'No hay reservas en el calendario'
                  }
                </p>
              </div>
            ) : (
              <CalendarView
                bookings={filteredBookings}
                onBookingClick={handleBookingClick}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de edición */}
      {editingBooking && (
        <BookingDialog
          booking={editingBooking}
          variant="edit"
          open={!!editingBooking}
          onOpenChange={(open) => {
            if (!open) setEditingBooking(null)
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* Modal para CREAR */}
      <BookingDialog
        variant="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}