// src/components/bookings/BookingCard.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Loader2 } from 'lucide-react'
import { Booking, BookingStatus } from '@/lib/api/bookings'

interface BookingCardProps {
  booking: Booking
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  isDeleting?: boolean
}

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

export function BookingCard({ booking, onEdit, onDelete, isDeleting = false }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

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

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-2 h-12 rounded-full ${
          booking.courts?.type === 'PADEL' ? 'bg-blue-500' : 'bg-orange-500'
        }`} />
        
        <div className="flex-1">
          <div className="font-medium flex items-center space-x-2">
            <span>{booking.courts?.name}</span>
            <Badge variant="outline">
              {booking.courts?.type}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(booking.start_time)} • {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
          </div>
        </div>

        <div className="text-right">
          <div className="font-medium">
            {booking.clients?.name || 'Cliente ocasional'}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
            {booking.amount > 0 && (
              <span className="text-sm font-semibold">
                {formatAmount(booking.amount)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(booking)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(booking)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}