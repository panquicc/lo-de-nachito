// src/components/bookings/BookingForm.tsx - CORREGIDO
'use client'

import { Booking, CreateBookingData, BookingStatus, PaymentMethod } from '@/lib/api/bookings'
import { useBookingValidation } from '@/hooks/useBookingValidation'
import { InputMoneda } from '@/components/ui/input-moneda'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { ArgentinaDateUtils } from '@/lib/date-utils'
import { Textarea } from '@/components/ui/textarea'
import { useClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { useCourts } from '@/hooks/useCourts'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface BookingFormProps {
  booking?: Booking
  onSubmit: (data: CreateBookingData) => void
  onCancel: () => void
  isLoading?: boolean
}

// Mover calculateDuration fuera del componente
const calculateDuration = (start: string, end: string): string => {
  const startTime = new Date(start)
  const endTime = new Date(end)
  return ((endTime.getTime() - startTime.getTime()) / (1000 * 60)).toString()
}

// Mover generateTimeOptions fuera del componente
const generateTimeOptions = () => {
  const options = []
  for (let hour = 8; hour <= 23; hour++) {
    options.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 23) { // No agregar 23:30
      options.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

export function BookingForm({ booking, onSubmit, onCancel, isLoading = false }: BookingFormProps) {
  const { data: courts } = useCourts()
  const { data: clients } = useClients()
  const { checkAvailability, isChecking } = useBookingValidation()
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Agregar amount al estado inicial
  const [formData, setFormData] = useState({
    court_id: booking?.court_id || '',
    client_id: booking?.client_id || '',
    start_date: booking ? ArgentinaDateUtils.formatDateForInput(new Date(booking.start_time)) : ArgentinaDateUtils.formatDateForInput(new Date()),
    start_time: booking ? ArgentinaDateUtils.formatTime(new Date(booking.start_time)) : '18:00',
    duration: booking ? calculateDuration(booking.start_time, booking.end_time) : '60',
    status: booking?.status || 'PENDIENTE' as BookingStatus,
    hour_price: booking?.hour_price || (courts?.find(c => c.id === booking?.court_id)?.hour_price || 0),
    deposit_amount: booking?.deposit_amount || 0,
    payment_method: booking?.payment_method || 'EFECTIVO' as PaymentMethod,
    cash_amount: booking?.cash_amount || 0,
    mercado_pago_amount: booking?.mercado_pago_amount || 0,
    amount: booking?.amount || 0,
    notes: booking?.notes || ''
  })

  // Verificar disponibilidad cuando cambien los horarios
  useEffect(() => {
    const verifyAvailability = async () => {
      if (!formData.court_id || !formData.start_date || !formData.start_time || !formData.duration) {
        setAvailabilityError('')
        return
      }

      try {
        // Crear fecha de forma más robusta
        const [year, month, day] = formData.start_date.split('-').map(Number);
        const [hour, minute] = formData.start_time.split(':').map(Number);

        // Validar partes
        if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
          setAvailabilityError('Fecha u hora inválida');
          return;
        }

        // Crear fecha local (asumiendo que es hora argentina)
        const localStartDate = new Date(year, month - 1, day, hour, minute);
        if (isNaN(localStartDate.getTime())) {
          setAvailabilityError('Fecha inválida');
          return;
        }

        const durationMs = parseInt(formData.duration) * 60000;
        const localEndDate = new Date(localStartDate.getTime() + durationMs);

        if (isNaN(localEndDate.getTime())) {
          setAvailabilityError('Duración inválida');
          return;
        }

        // DEBUG: Ver qué fechas estamos creando
        console.log('🕒 DEBUG Fechas:');
        console.log('Input:', `${formData.start_date}T${formData.start_time}`);
        console.log('Local Start:', localStartDate.toString());
        console.log('Local End:', localEndDate.toString());

        // Convertir a UTC para la validación
        const startUTC = ArgentinaDateUtils.localToUTC(localStartDate);
        const endUTC = ArgentinaDateUtils.localToUTC(localEndDate);

        console.log('UTC Start:', startUTC.toString());
        console.log('UTC End:', endUTC.toString());

        const conflict = await checkAvailability(
          formData.court_id,
          startUTC.toISOString(),
          endUTC.toISOString(),
          booking?.id
        )

        if (conflict.isConflict) {
          setAvailabilityError(conflict.message || 'La cancha no está disponible en este horario')
        } else {
          setAvailabilityError('')
        }
      } catch (error) {
        console.error('Error verificando disponibilidad:', error)
        setAvailabilityError('Error al verificar disponibilidad')
      }
    }

    const timeoutId = setTimeout(verifyAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.court_id, formData.start_date, formData.start_time, formData.duration, booking?.id])

  // Cargar precio de la cancha cuando se selecciona
  useEffect(() => {
    if (formData.court_id && courts) {
      const selectedCourt = courts.find(c => c.id === formData.court_id)
      if (selectedCourt && selectedCourt.hour_price > 0) {
        setFormData(prev => ({
          ...prev,
          hour_price: selectedCourt.hour_price
        }))
      }
    }
  }, [formData.court_id, courts])

  // Calcular amount automáticamente
  useEffect(() => {
    const hours = parseInt(formData.duration) / 60
    const totalAmount = hours * formData.hour_price
    const calculatedAmount = Math.max(0, totalAmount - formData.deposit_amount)

    setFormData(prev => ({
      ...prev,
      amount: calculatedAmount
    }))
  }, [formData.duration, formData.hour_price, formData.deposit_amount])

  // Unificar la lógica de pagos en los handlers
  const updatePaymentDistribution = (paymentMethod: PaymentMethod, amount: number) => {
    switch (paymentMethod) {
      case 'EFECTIVO':
        return { cash_amount: amount, mercado_pago_amount: 0 }
      case 'MERCADO_PAGO':
        return { cash_amount: 0, mercado_pago_amount: amount }
      case 'MIXTO':
        // Para mixto, mantener la proporción actual o dividir equitativamente
        const currentTotal = formData.cash_amount + formData.mercado_pago_amount
        if (currentTotal === 0) {
          const half = amount / 2
          return { cash_amount: half, mercado_pago_amount: half }
        }
        // Mantener la proporción actual
        const ratio = formData.cash_amount / currentTotal
        return {
          cash_amount: amount * ratio,
          mercado_pago_amount: amount * (1 - ratio)
        }
      default:
        return {}
    }
  }

  // Calcular distribución de pagos
  useEffect(() => {
    if (formData.payment_method === 'EFECTIVO') {
      setFormData(prev => ({
        ...prev,
        cash_amount: formData.amount,
        mercado_pago_amount: 0
      }))
    } else if (formData.payment_method === 'MERCADO_PAGO') {
      setFormData(prev => ({
        ...prev,
        cash_amount: 0,
        mercado_pago_amount: formData.amount
      }))
    }
  }, [formData.payment_method, formData.amount])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (availabilityError) {
      toast.error('Por favor corrige el conflicto de horario antes de enviar.')
      return
    }

    const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`)
    const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000)

    const bookingData: CreateBookingData = {
      court_id: formData.court_id,
      client_id: formData.client_id === 'ocasional' ? undefined : formData.client_id || undefined,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: formData.status,
      amount: formData.amount,
      payment_method: formData.payment_method,
      cash_amount: formData.cash_amount,
      mercado_pago_amount: formData.mercado_pago_amount,
      hour_price: formData.hour_price,
      deposit_amount: formData.deposit_amount,
      notes: formData.notes
    }

    onSubmit(bookingData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="court_id">Cancha *</Label>
          <Select
            value={formData.court_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, court_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cancha" />
            </SelectTrigger>
            <SelectContent>
              {courts?.map((court) => (
                <SelectItem key={court.id} value={court.id}>
                  {court.name} ({court.type}) - ${court.hour_price}/hora
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente</Label>
          <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Cliente ocasional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ocasional">Cliente ocasional</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Fecha *</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Hora de inicio *</Label>
          <Select
            value={formData.start_time}
            onValueChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duración *</Label>
          <Select
            value={formData.duration}
            onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutos (Media hora)</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 ½ horas</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
              <SelectItem value="150">2 ½ horas</SelectItem>
              <SelectItem value="180">3 horas</SelectItem>
              <SelectItem value="210">3 ½ horas</SelectItem>
              <SelectItem value="240">4 horas</SelectItem>
              <SelectItem value="270">4 ½ horas</SelectItem>
              <SelectItem value="300">5 horas</SelectItem>
              <SelectItem value="330">5 ½ horas</SelectItem>
              <SelectItem value="360">6 horas</SelectItem>
              <SelectItem value="390">6 ½ horas</SelectItem>
              <SelectItem value="420">7 horas</SelectItem>
              <SelectItem value="450">7 ½ horas</SelectItem>
              <SelectItem value="480">8 horas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mostrar error de disponibilidad */}
      {availabilityError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{availabilityError}</span>
          </div>
        </div>
      )}

      {/* Mostrar loading durante verificación */}
      {isChecking && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
            <span className="text-blue-700 text-sm">Verificando disponibilidad...</span>
          </div>
        </div>
      )}

      {/* Precios y Pagos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Precios</h3>

          <InputMoneda
            label='Precio por hora *'
            value={formData.hour_price}
            onChange={(value) => setFormData(prev => ({ ...prev, hour_price: value }))}
            required
          />

          <InputMoneda
            label='Seña (descuento)'
            value={formData.deposit_amount}
            onChange={(value) => setFormData(prev => ({ ...prev, deposit_amount: value }))}
            placeholder='0.00'
          />

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between font-semibold">
              <span>Total a pagar:</span>
              <span>${formData.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Método de Pago</h3>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de pago *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) => {
                const distribution = updatePaymentDistribution(value, formData.amount)
                setFormData(prev => ({
                  ...prev,
                  payment_method: value,
                  ...distribution
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="MERCADO_PAGO">Mercado Pago</SelectItem>
                <SelectItem value="MIXTO">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_method !== 'MERCADO_PAGO' && (
            <InputMoneda
              label="Efectivo"
              value={formData.cash_amount}
              onChange={(value) => setFormData(prev => {
                const newMercadoPago = Math.max(0, prev.amount - value)
                return {
                  ...prev,
                  cash_amount: value,
                  mercado_pago_amount: newMercadoPago,
                  payment_method: value > 0 && newMercadoPago > 0 ? 'MIXTO' : prev.payment_method
                }
              })}
              disabled={formData.payment_method === 'EFECTIVO'}
              placeholder="0.00"
            />
          )}

          {formData.payment_method !== 'EFECTIVO' && (
            <InputMoneda
              label="Mercado Pago"
              value={formData.mercado_pago_amount}
              onChange={(value) => setFormData(prev => {
                const newCashAmount = Math.max(0, prev.amount - value)
                return {
                  ...prev,
                  mercado_pago_amount: value,
                  cash_amount: newCashAmount,
                  payment_method: value > 0 && newCashAmount > 0 ? 'MIXTO' : prev.payment_method
                }
              })}
              disabled={formData.payment_method === 'MERCADO_PAGO'}
              placeholder="0.00"
            />
          )}

          {/* Mostrar advertencia si la suma no coincide */}
          {(formData.cash_amount + formData.mercado_pago_amount).toFixed(2) !== formData.amount.toFixed(2) && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700 text-sm">
                La suma de los pagos (${(formData.cash_amount + formData.mercado_pago_amount).toFixed(2)}) no coincide con el total (${formData.amount.toFixed(2)})
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Estado *</Label>
            <Select value={formData.status} onValueChange={(value: BookingStatus) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="SEÑADO">Señado</SelectItem>
                <SelectItem value="PAGADO">Pagado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notas adicionales..."
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {booking ? 'Actualizar Turno' : 'Crear Turno'}
        </Button>
      </div>
    </form>
  )
}