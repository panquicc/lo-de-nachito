// src/app/components/bookings/BookingsCalendar.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useBookings } from '@/hooks/useBookings'
import { useCourts } from '@/hooks/useCourts'
import { Booking, BookingStatus } from '@/lib/api/bookings'
import { Court } from '@/lib/api/courts'
import { Edit, Clock, User, MapPin } from 'lucide-react'
import BookingDialog from './BookingDialog'

const statusColors: Record<BookingStatus, string> = {
  PAGADO: 'bg-green-100 text-green-800 border-green-200',
  SEÑADO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PENDIENTE: 'bg-red-100 text-red-800 border-red-200',
  CANCELADO: 'bg-gray-100 text-gray-800 border-gray-200'
}

const typeColors = {
  PADEL: 'bg-blue-100 text-blue-800',
  FUTBOL: 'bg-orange-100 text-orange-800'
}

export default function BookingsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedCourt, setSelectedCourt] = useState<string>('')

  const dateString = selectedDate.toISOString().split('T')[0]
  const { data: bookings, isLoading, error } = useBookings(dateString, selectedCourt || undefined)
  const { data: courts } = useCourts()

  const bookingsForDate = bookings || []

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDateTitle = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  const getCourtType = (court: Court) => {
    return court.type === 'PADEL' ? 'PADEL' : 'FUTBOL'
  }

  const getBookingType = (booking: Booking) => {
    return booking.courts?.type === 'PADEL' ? 'PADEL' : 'FUTBOL'
  }

  const getStatusText = (status: BookingStatus) => {
    const statusMap = {
      PENDIENTE: 'Pendiente',
      SEÑADO: 'Señado',
      PAGADO: 'Pagado',
      CANCELADO: 'Cancelado'
    }
    return statusMap[status]
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="flex space-x-1">
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                        <div className="h-5 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                    <div className="w-9 h-9 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error cargando turnos: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario Lateral */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selector de fecha */}
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha</label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            {/* Filtro por cancha */}
            <div>
              <label className="text-sm font-medium mb-2 block">Filtrar por cancha</label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todas las canchas</option>
                {courts?.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Lista de canchas */}
            <div className="space-y-2">
              <h3 className="font-semibold">Canchas</h3>
              <div className="space-y-1">
                {courts?.map((court) => (
                  <div key={court.id} className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        court.type === 'PADEL' ? 'bg-blue-500' : 'bg-orange-500'
                      }`} 
                    />
                    <span className="text-sm">{court.name}</span>
                    {!court.is_active && (
                      <Badge variant="outline" className="text-xs">Inactiva</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Resumen del día</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total turnos:</span>
                  <span className="font-medium">{bookingsForDate.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pagados:</span>
                  <span className="font-medium text-green-600">
                    {bookingsForDate.filter(b => b.status === 'PAGADO').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="font-medium text-red-600">
                    {bookingsForDate.filter(b => b.status === 'PENDIENTE').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Turnos del Día */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Turnos para {formatDateTitle(selectedDate)}
              {selectedCourt && courts && (
                <span className="text-gray-600 ml-2">
                  • {courts.find(c => c.id === selectedCourt)?.name}
                </span>
              )}
            </span>
            <Badge variant="outline">
              {bookingsForDate.length} turno{bookingsForDate.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsForDate.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay turnos para esta fecha</p>
              <p className="text-sm mt-1">
                {selectedCourt ? 'Prueba cambiar el filtro de cancha' : 'No hay reservas programadas para hoy'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookingsForDate.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-2 h-12 rounded-full ${
                        getBookingType(booking) === 'PADEL' ? 'bg-blue-500' : 'bg-orange-500'
                      }`} 
                    />
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{booking.courts?.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={typeColors[getBookingType(booking) as keyof typeof typeColors]}
                        >
                          {getBookingType(booking)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </span>
                        </div>
                        {booking.amount > 0 && (
                          <div className="font-medium text-gray-700">
                            ${booking.amount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium flex items-center justify-end space-x-1">
                        <User className="h-3 w-3" />
                        <span>{booking.clients?.name || 'Cliente ocasional'}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={statusColors[booking.status]}
                        >
                          {getStatusText(booking.status)}
                        </Badge>
                        {booking.notes && (
                          <div className="text-xs text-gray-500 max-w-[120px] truncate" title={booking.notes}>
                            💬
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <BookingDialog 
                      booking={booking} 
                      variant="edit"
                      open={false}
                      onOpenChange={() => {}}
                      onSuccess={() => fetch(
                        `/bookings?date=${dateString}${selectedCourt ? `&court_id=${selectedCourt}` : ''}`
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}