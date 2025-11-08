// src/components/bookings/BookingDialog.tsx (actualizado)
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { BookingForm } from './BookingForm'
import { Booking, CreateBookingData } from '@/lib/api/bookings'
import { useCreateBooking, useUpdateBooking } from '@/hooks/useBookings'
import { useMobile } from '@/hooks/useMobile'

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
  const isMobile = useMobile()
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

  const formContent = (
    <BookingForm
      booking={booking}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-xl">
              {variant === 'create' ? 'Crear Nuevo Turno' : 'Editar Turno'}
            </DrawerTitle>
            <DrawerDescription>
              {variant === 'create'
                ? 'Completá los datos del nuevo turno.'
                : 'Modificá los datos del turno.'
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

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
        {formContent}
      </DialogContent>
    </Dialog>
  )
}