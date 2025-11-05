// src/components/dashboard/TodayBookings.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBookings } from '@/hooks/useBookings'
import { Clock, User, MapPin, Loader2, Calendar } from 'lucide-react'
import { Booking, BookingStatus } from '@/lib/api/bookings'

const statusColors: Record<BookingStatus, string> = {
  PAGADO: 'bg-green-100 text-green-800 border-green-200',
  SEÑADO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PENDIENTE: 'bg-red-100 text-red-800 border-red-200',
  CANCELADO: 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusLabels: Record<BookingStatus, string> = {
  PAGADO: 'Pagado',
  SEÑADO: 'Señado',
  PENDIENTE: 'Pendiente',
  CANCELADO: 'Cancelado'
}

const typeColors = {
  PADEL: 'bg-blue-100 text-blue-800 border-blue-200',
  FUTBOL: 'bg-orange-100 text-orange-800 border-orange-200'
}

export default function TodayBookings() {
  // Obtener turnos del día actual
  const today = new Date().toISOString().split('T')[0]
  const { data: bookings, isLoading, error } = useBookings(today)

  // Filtrar solo los turnos que están por venir o en curso (más flexible)
  const upcomingBookings = bookings?.filter(booking => {
    const now = new Date()
    const bookingStart = new Date(booking.start_time)
    const bookingEnd = new Date(booking.end_time)
    
    // Mostrar turnos que:
    // 1. Estén en curso (ahora entre start_time y end_time)
    // 2. O empiecen en las próximas 6 horas
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000)
    
    return (now >= bookingStart && now <= bookingEnd) || // En curso
           (bookingStart >= now && bookingStart <= sixHoursFromNow) // Próximas 6 horas
  }) || []

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const getBookingType = (booking: Booking) => {
    return booking.courts?.type === 'PADEL' ? 'PADEL' : 'FUTBOL'
  }

  const getTimeStatus = (booking: Booking) => {
    const now = new Date()
    const start = new Date(booking.start_time)
    const end = new Date(booking.end_time)
    
    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'in-progress'
    return 'completed'
  }

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Turnos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="space-y-3 px-4 pb-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Turnos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600 p-4">
            Error cargando turnos: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si no hay bookings del día, mostrar mensaje
  if (!bookings || bookings.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Turnos de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
          <MapPin className="h-12 w-12 mb-2 text-gray-300" />
          <p className="font-medium text-gray-500">No hay turnos hoy</p>
          <p className="text-sm text-gray-400">No hay reservas programadas para hoy</p>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = bookings.reduce((total, booking) => {
    return booking.status === 'PAGADO' ? total + booking.amount : total
  }, 0)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Turnos de Hoy
          </span>
          <Badge variant="outline">
            {upcomingBookings.length} próximo{upcomingBookings.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {upcomingBookings.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
            <MapPin className="h-12 w-12 mb-2 text-gray-300" />
            <p className="font-medium">No hay turnos próximos</p>
            <p className="text-sm text-center">
              Hay {bookings.length} turno{bookings.length !== 1 ? 's' : ''} hoy, 
              pero ninguno en las próximas horas
            </p>
          </div>
        ) : (
          <>
            {/* Lista de turnos con scroll */}
            <div className="flex-1 overflow-y-auto px-4 pb-3 max-h-80"> {/* Altura máxima de ~320px */}
              <div className="space-y-2">
                {upcomingBookings.map((booking) => {
                  const timeStatus = getTimeStatus(booking)
                  const bookingType = getBookingType(booking)
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div 
                          className={`w-2 h-10 rounded-full flex-shrink-0 ${
                            timeStatus === 'in-progress' 
                              ? 'bg-green-500 animate-pulse' 
                              : bookingType === 'PADEL' 
                                ? 'bg-blue-500' 
                                : 'bg-orange-500'
                          }`} 
                          title={timeStatus === 'in-progress' ? 'En curso' : bookingType}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium flex items-center space-x-2">
                            <span className="truncate">{booking.courts?.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`flex-shrink-0 ${typeColors[bookingType as keyof typeof typeColors]}`}
                            >
                              {bookingType}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                            {timeStatus === 'in-progress' && (
                              <Badge variant="default" className="bg-green-500 text-white text-xs flex-shrink-0">
                                Ahora
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-2 min-w-0">
                        <div className="font-medium flex items-center justify-end space-x-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate" title={booking.clients?.name || 'Cliente ocasional'}>
                            {booking.clients?.name || 'Cliente ocasional'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 justify-end">
                          <Badge 
                            variant="secondary" 
                            className={statusColors[booking.status]}
                          >
                            {statusLabels[booking.status]}
                          </Badge>
                          {booking.amount > 0 && (
                            <div className="text-sm font-semibold whitespace-nowrap">
                              {formatAmount(booking.amount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Resumen del día - Siempre visible */}
            <div className="flex-shrink-0 border-t p-4 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 font-medium">Total turnos hoy:</div>
                  <div className="font-semibold">{bookings.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-600 font-medium">Facturación:</div>
                  <div className="font-semibold text-green-600">
                    {formatAmount(totalRevenue)}
                  </div>
                </div>
              </div>
              
              {/* Mini estadísticas */}
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>
                  Pagados: {bookings.filter(b => b.status === 'PAGADO').length}
                </span>
                <span>
                  Señados: {bookings.filter(b => b.status === 'SEÑADO').length}
                </span>
                <span>
                  Pendientes: {bookings.filter(b => b.status === 'PENDIENTE').length}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}