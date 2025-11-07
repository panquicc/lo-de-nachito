// src/components/bookings/BookingCard.tsx
'use client'

import { Trash2, Loader2, CreditCard, DollarSign } from 'lucide-react'
import { formatArgentinaDate, formatArgentinaTime } from '@/lib/date-utils'
import { Booking, BookingStatus } from '@/lib/api/bookings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

const paymentMethodIcons: Record<string, React.ReactNode> = {
  EFECTIVO: <DollarSign className="h-3 w-3" />,
  MERCADO_PAGO: <CreditCard className="h-3 w-3" />,
  MIXTO: (
    <div className="flex">
      <DollarSign className="h-3 w-3" />
      <CreditCard className="h-3 w-3 -ml-1" />
    </div>
  )
}

const paymentMethodLabels: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  MERCADO_PAGO: 'Mercado Pago',
  MIXTO: 'Mixto'
}

export function BookingCard({ booking, onEdit, onDelete, isDeleting = false }: BookingCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const getPaymentSummary = () => {
    if (booking.payment_method === 'EFECTIVO') {
      return `Efectivo: ${formatAmount(booking.cash_amount)}`
    } else if (booking.payment_method === 'MERCADO_PAGO') {
      return `MP: ${formatAmount(booking.mercado_pago_amount)}`
    } else {
      return `Efectivo: ${formatAmount(booking.cash_amount)} | MP: ${formatAmount(booking.mercado_pago_amount)}`
    }
  }

  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
      onClick={() => onEdit(booking)} // ← Hacer toda la tarjeta clickeable
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-2 h-12 rounded-full ${booking.courts?.type === 'PADEL' ? 'bg-blue-500' : 'bg-orange-500'
          }`} />

        <div className="flex-1">
          <div className="font-medium flex items-center space-x-2 mb-1">
            <span>{booking.courts?.name}</span>
            <Badge variant="outline">
              {booking.courts?.type}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            {formatArgentinaDate(new Date(booking.start_time))} • {formatArgentinaTime(new Date(booking.start_time))} - {formatArgentinaTime(new Date(booking.end_time))}
          </div>
          <div className="text-sm font-medium">
            {booking.clients?.name || 'Cliente ocasional'}
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="flex items-center justify-end space-x-2">
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {paymentMethodIcons[booking.payment_method]}
              {paymentMethodLabels[booking.payment_method]}
            </Badge>
          </div>

          <div className="text-sm space-y-1">
            {booking.hour_price > 0 && (
              <div className="text-gray-600">
                Hora: {formatAmount(booking.hour_price)}
              </div>
            )}
            {booking.deposit_amount > 0 && (
              <div className="text-green-600">
                Seña: -{formatAmount(booking.deposit_amount)}
              </div>
            )}
            <div className="font-semibold text-lg">
              Total: {formatAmount(booking.amount)}
            </div>
            {(booking.cash_amount > 0 || booking.mercado_pago_amount > 0) && (
              <div className="text-xs text-gray-500">
                {getPaymentSummary()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center flex-col space-x-2 opacity-100 gap-2 ml-4 sm:flex-col sm:opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()} // ← Evitar que el click se propague a la tarjeta
      >

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