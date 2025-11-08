// src/components/bookings/BookingCard.tsx
'use client'

import { Trash2, Loader2, CreditCard, DollarSign, Edit, MapPin, Clock, User } from 'lucide-react'
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
      className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer gap-3 sm:gap-4"
      onClick={() => onEdit(booking)}
    >
      {/* Header móvil - Información principal */}
      <div className="flex items-start justify-between sm:hidden w-full">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Indicador de tipo de cancha */}
          <div className={`w-2 h-10 rounded-full flex-shrink-0 ${booking.courts?.type === 'PADEL' ? 'bg-blue-500' : 'bg-orange-500'}`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-sm truncate">{booking.courts?.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{formatArgentinaTime(new Date(booking.start_time))} - {formatArgentinaTime(new Date(booking.end_time))}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="truncate">{booking.clients?.name || 'Cliente ocasional'}</span>
            </div>
          </div>
        </div>

        {/* Estado en header móvil */}
        <Badge className={`${statusColors[booking.status]} text-xs ml-2 flex-shrink-0`}>
          {statusLabels[booking.status]}
        </Badge>
      </div>

      {/* Contenido principal desktop */}
      <div className="hidden sm:flex items-center space-x-4 flex-1 min-w-0">
        {/* Indicador de tipo de cancha */}
        <div className={`w-2 h-12 rounded-full flex-shrink-0 ${booking.courts?.type === 'PADEL' ? 'bg-blue-500' : 'bg-orange-500'}`} />

        {/* Información del turno */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium truncate">{booking.courts?.name}</span>
            <Badge variant="outline">
              {booking.courts?.type}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            {formatArgentinaDate(new Date(booking.start_time))} • {formatArgentinaTime(new Date(booking.start_time))} - {formatArgentinaTime(new Date(booking.end_time))}
          </div>
          <div className="text-sm font-medium truncate">
            {booking.clients?.name || 'Cliente ocasional'}
          </div>
        </div>
      </div>

      {/* Información de pago y estado - Reorganizada para móvil */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
        {/* Información de precios - Ahora ocupa más espacio en móvil */}
        <div className="flex-1 sm:text-right space-y-1 min-w-0">
          {/* Método de pago - solo en móvil */}
          <div className="flex items-center justify-between sm:hidden mb-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {paymentMethodIcons[booking.payment_method]}
              {paymentMethodLabels[booking.payment_method]}
            </Badge>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-2 sm:block sm:space-y-1">
            {booking.hour_price > 0 && (
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="sm:hidden">Precio hora: </span>
                {formatAmount(booking.hour_price)}
              </div>
            )}
            {booking.deposit_amount > 0 && (
              <div className="text-xs sm:text-sm text-green-600">
                <span className="sm:hidden">Seña: </span>
                -{formatAmount(booking.deposit_amount)}
              </div>
            )}
            <div className="font-semibold text-base sm:text-lg col-span-2 sm:col-span-1">
              <span className="sm:hidden">Total: </span>
              {formatAmount(booking.amount)}
            </div>
          </div>

          {/* Resumen de pagos */}
          {(booking.cash_amount > 0 || booking.mercado_pago_amount > 0) && (
            <div className="text-xs text-gray-500 mt-1 sm:mt-0">
              {getPaymentSummary()}
            </div>
          )}
        </div>

        {/* Estado y método de pago desktop */}
        <div className="hidden sm:flex flex-col items-end space-y-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Badge className={statusColors[booking.status]}>
              {statusLabels[booking.status]}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {paymentMethodIcons[booking.payment_method]}
              {paymentMethodLabels[booking.payment_method]}
            </Badge>
          </div>
        </div>

        {/* Acciones - Reorganizadas para móvil */}
        <div
          className="flex items-center justify-end space-x-2 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-full sm:w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En móvil, los botones ocupan todo el ancho */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Botón editar - solo en desktop */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(booking)}
              className="hidden sm:flex h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>

            {/* Botón eliminar - en móvil ocupa más espacio */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(booking)}
              disabled={isDeleting}
              className="flex-1 sm:flex-initial h-9 sm:h-8 sm:w-8 p-0 sm:p-0"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                  <span className="ml-2 sm:hidden">Eliminar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}