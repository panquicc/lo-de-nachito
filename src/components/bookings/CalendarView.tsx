// src/components/bookings/CalendarView.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Booking } from '@/lib/api/bookings'

interface CalendarViewProps {
  bookings: Booking[]
}

export function CalendarView({ bookings }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const days = getDaysInMonth(selectedDate)
  const monthName = selectedDate.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  })

  const bookingsByDate = bookings?.reduce((acc, booking) => {
    const date = new Date(booking.start_time).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(booking)
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
    <div className="space-y-4">
      {/* Controles del calendario */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigateMonth('prev')}>
          ← Mes anterior
        </Button>
        <h3 className="text-xl font-semibold capitalize">{monthName}</h3>
        <Button variant="outline" onClick={() => navigateMonth('next')}>
          Mes siguiente →
        </Button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const dayBookings = getBookingsForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={day.toString()}
              className={`min-h-24 p-1 border rounded-lg ${
                isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {dayBookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    className={`text-xs p-1 rounded border ${
                      booking.status === 'PAGADO' 
                        ? 'bg-green-100 border-green-200' 
                        : booking.status === 'SEÑADO'
                        ? 'bg-yellow-100 border-yellow-200'
                        : 'bg-red-100 border-red-200'
                    }`}
                    title={`${booking.courts?.name} - ${booking.clients?.name || 'Cliente ocasional'}`}
                  >
                    <div className="font-medium truncate">
                      {formatTime(booking.start_time)}
                    </div>
                    <div className="truncate">
                      {booking.courts?.name}
                    </div>
                  </div>
                ))}
                
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayBookings.length - 3} más
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Pagado</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>Señado</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  )
}