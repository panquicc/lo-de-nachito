// src/components/bookings/BookingDialog.ts
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookingForm } from './BookingForm'
import { Booking, CreateBookingData } from '@/lib/api/bookings'
import { useCreateBooking, useUpdateBooking } from '@/hooks/useBookings'

interface BookingDialogProps {
  booking?: Booking
  variant?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function BookingDialog({
  booking,
  variant = 'create',
  open,
  onOpenChange,
  onSuccess
}: BookingDialogProps) {
  const createBookingMutation = useCreateBooking()
  const updateBookingMutation = useUpdateBooking()

  const handleSubmit = async (data: CreateBookingData) => {
    try {
      if (variant === 'create') {
        await createBookingMutation.mutateAsync(data)
      } else if (booking) {
        await updateBookingMutation.mutateAsync({ id: booking.id, updates: data })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting booking:', error)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const isLoading = createBookingMutation.isPending || updateBookingMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {variant === 'create' ? 'Crear Nuevo Turno' : 'Editar Turno'}
          </DialogTitle>
          <DialogDescription>
            {variant === 'create'
              ? 'Completá los datos del nuevo turno.'
              : 'Modificá los datos del turno.'
            }
          </DialogDescription>
        </DialogHeader>

        <BookingForm
          booking={booking}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}