// src/components/bookings/BookingDialog.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit } from 'lucide-react'
import { useState } from 'react'
import BookingForm from './BookingForm'
import { Booking, CreateBookingData } from '@/lib/api/bookings'
import { useCreateBooking, useUpdateBooking } from '@/hooks/useBookings'

interface BookingDialogProps {
  booking?: Booking
  variant?: 'create' | 'edit'
  onSuccess?: () => void
}

export default function BookingDialog({ booking, variant = 'create', onSuccess }: BookingDialogProps) {
  const [open, setOpen] = useState(false)
  const createBookingMutation = useCreateBooking()
  const updateBookingMutation = useUpdateBooking()

  const handleSubmit = async (data: CreateBookingData) => {
    try {
      if (variant === 'create') {
        await createBookingMutation.mutateAsync(data)
      } else if (booking) {
        await updateBookingMutation.mutateAsync({ id: booking.id, updates: data })
      }
      
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting booking:', error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const isLoading = createBookingMutation.isPending || updateBookingMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'create' ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Turno
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
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