// src/app/dashboard/bookings/new/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BookingForm from '@/components/bookings/BookingForm'
import { CreateBookingData } from '@/lib/api/bookings'
import { useCreateBooking } from '@/hooks/useBookings'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBookingPage() {
  const router = useRouter()
  const createBookingMutation = useCreateBooking()

  const handleSubmit = async (data: CreateBookingData) => {
    try {
      await createBookingMutation.mutateAsync(data)
      router.push('/dashboard/bookings')
    } catch (error) {
      console.error('Error creating booking:', error)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/bookings')
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Turno</h1>
          <p className="text-gray-600">Completá los datos para crear un nuevo turno</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Turno</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createBookingMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}