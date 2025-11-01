// src/components/bookings/BookingForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, UserPlus } from 'lucide-react'
import { useCourts } from '@/hooks/useCourts'
import { useClients } from '@/hooks/useClients'
import { useCreateClient } from '@/hooks/useClients'
import { Booking, CreateBookingData } from '@/lib/api/bookings'

const bookingSchema = z.object({
  court_id: z.string().min(1, 'La cancha es requerida'),
  client_id: z.string().optional(),
  start_time: z.string().min(1, 'La fecha y hora de inicio es requerida'),
  end_time: z.string().min(1, 'La fecha y hora de fin es requerida'),
  status: z.enum(['PENDIENTE', 'SEÑADO', 'PAGADO', 'CANCELADO']),
  amount: z.number().min(0, 'El monto no puede ser negativo'),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  booking?: Booking
  onSubmit: (data: CreateBookingData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function BookingForm({ booking, onSubmit, onCancel, isLoading = false }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientForm, setShowClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({ name: '', phone: '', email: '' })

  const { data: courts } = useCourts()
  const { data: clients } = useClients(clientSearch || undefined)
  const createClientMutation = useCreateClient()

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      court_id: booking?.court_id || '',
      client_id: booking?.client_id || '',
      start_time: booking?.start_time ? new Date(booking.start_time).toISOString().slice(0, 16) : '',
      end_time: booking?.end_time ? new Date(booking.end_time).toISOString().slice(0, 16) : '',
      status: booking?.status || 'PENDIENTE',
      amount: booking?.amount || 0,
      notes: booking?.notes || '',
    },
  })

  // Calcular automáticamente el end_time basado en la duración estándar
  const updateEndTime = (startTime: string, courtType?: string) => {
    if (!startTime) return
    
    const start = new Date(startTime)
    const duration = courtType === 'FUTBOL' ? 90 : 60 // 90 mins para fútbol, 60 para pádel
    const end = new Date(start.getTime() + duration * 60000)
    
    form.setValue('end_time', end.toISOString().slice(0, 16))
  }

  const handleCourtChange = (courtId: string) => {
    const court = courts?.find(c => c.id === courtId)
    const startTime = form.getValues('start_time')
    
    if (startTime && court) {
      updateEndTime(startTime, court.type)
    }

    // Setear precio por defecto basado en el tipo de cancha
    const defaultPrice = court?.type === 'FUTBOL' ? 15000 : 12000
    form.setValue('amount', defaultPrice)
  }

  const handleStartTimeChange = (startTime: string) => {
    const courtId = form.getValues('court_id')
    const court = courts?.find(c => c.id === courtId)
    updateEndTime(startTime, court?.type)
  }

  const handleCreateClient = async () => {
    if (!newClientData.name.trim()) {
      alert('El nombre del cliente es requerido')
      return
    }

    try {
      const client = await createClientMutation.mutateAsync(newClientData)
      form.setValue('client_id', client.id)
      setShowClientForm(false)
      setNewClientData({ name: '', phone: '', email: '' })
      setClientSearch('')
    } catch (error) {
      alert('Error al crear cliente: ' + (error as Error).message)
    }
  }

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    try {
      // Convertir strings de fecha a ISO string
      const submitData: CreateBookingData = {
        ...data,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        client_id: data.client_id || undefined,
        notes: data.notes || undefined,
      }
      await onSubmit(submitData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeCourts = courts?.filter(court => court.is_active) || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Cancha */}
        <FormField
          control={form.control}
          name="court_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cancha *</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                handleCourtChange(value)
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cancha" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {activeCourts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} ({court.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cliente */}
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <div className="space-y-2">
                {!showClientForm ? (
                  <>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar cliente..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowClientForm(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ocasional">Cliente ocasional</SelectItem>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.phone && `- ${client.phone}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Nuevo Cliente</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowClientForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                    <Input
                      placeholder="Nombre completo *"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Teléfono"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Button
                      type="button"
                      onClick={handleCreateClient}
                      disabled={createClientMutation.isPending}
                      className="w-full"
                    >
                      {createClientMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Crear Cliente
                    </Button>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha y Hora de Inicio */}
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inicio *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleStartTimeChange(e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha y Hora de Fin */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="SEÑADO">Señado</SelectItem>
                    <SelectItem value="PAGADO">Pagado</SelectItem>
                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Monto */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas adicionales..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {booking ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              booking ? 'Actualizar Turno' : 'Crear Turno'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}