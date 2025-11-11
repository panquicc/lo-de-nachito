// src/components/bookings/CalendarView.tsx (actualizado)
'use client'

import { ArgentinaDateUtils } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Booking } from '@/lib/api/bookings'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarViewProps {
  bookings: Booking[]
  onBookingClick?: (booking: Booking) => void
}

export function CalendarView({ bookings, onBookingClick }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(ArgentinaDateUtils.getTime())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const firstDayOfWeek = firstDay.getDay()

    const days = []

    // Agregar días vacíos del mes anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Agregar días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const days = getDaysInMonth(selectedDate)
  const monthName = selectedDate.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  })

  const bookingsByDate = bookings?.reduce((acc, booking) => {
    const date = ArgentinaDateUtils.toArgentinaTime(new Date(booking.start_time))
    const dateKey = date.toDateString()
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  const getBookingsForDate = (date: Date) => {
    return bookingsByDate?.[date.toDateString()] || []
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Controles del calendario */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 px-2 sm:px-3"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline ml-1">Mes anterior</span>
        </Button>

        <h3 className="text-lg sm:text-xl font-semibold capitalize text-center flex-1 mx-2">
          {monthName}
        </h3>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 px-2 sm:px-3"
        >
          <span className="hidden sm:inline mr-1">Mes siguiente</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-3 sm:mb-4 text-xs sm:text-sm">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-1 sm:py-2 text-xs sm:text-sm">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-12 sm:min-h-16 p-0.5 sm:p-1 border rounded bg-gray-50 border-gray-200 opacity-50"
              />
            )
          }

          const dayBookings = getBookingsForDate(day)
          const isToday = day.toDateString() === ArgentinaDateUtils.getTime().toDateString()

          return (
            <div
              key={day.toString()}
              className={`min-h-12 sm:min-h-16 p-0.5 sm:p-1 border rounded ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-blue-600' : 'text-gray-700'
                }`}>
                {day.getDate()}
              </div>

              <div className="space-y-0.5 max-h-8 sm:max-h-16 overflow-y-auto">
                {dayBookings.slice(0, 2).map(booking => (
                  <div
                    key={booking.id}
                    className={`text-[10px] sm:text-xs p-0.5 rounded border cursor-pointer hover:shadow-md transition-shadow ${booking.status === 'PAGADO'
                        ? 'bg-green-100 border-green-200 hover:bg-green-200'
                        : booking.status === 'SEÑADO'
                          ? 'bg-yellow-100 border-yellow-200 hover:bg-yellow-200'
                          : 'bg-red-100 border-red-200 hover:bg-red-200'
                      }`}
                    title={`${ArgentinaDateUtils.formatTime(new Date(booking.start_time))} - ${booking.courts?.name
                      } - ${booking.clients?.name || 'Cliente ocasional'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onBookingClick?.(booking)
                    }}
                  >
                    <div className="font-medium truncate hidden xs:block">
                      {ArgentinaDateUtils.formatTime(new Date(booking.start_time))}
                    </div>
                    <div className="truncate">
                      {booking.courts?.name}
                    </div>
                  </div>
                ))}

                {dayBookings.length > 2 && (
                  <div className="text-[10px] text-gray-500 text-center">
                    +{dayBookings.length - 2}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Pagado</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Señado</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  )
}