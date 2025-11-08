// src/lib/api/bookings.ts
import { Client } from './clients'
import { Court } from './courts'

export type BookingStatus = 'PENDIENTE' | 'SEÑADO' | 'PAGADO' | 'CANCELADO'
export type PaymentMethod = 'EFECTIVO' | 'MERCADO_PAGO' | 'MIXTO'

export interface Booking {
  id: string
  court_id: string
  client_id?: string
  start_time: string
  end_time: string
  status: BookingStatus
  amount: number
  payment_method: PaymentMethod
  cash_amount: number
  mercado_pago_amount: number
  hour_price: number
  deposit_amount: number
  notes?: string
  created_at: string
  clients?: Client
  courts?: Court
}

export interface CreateBookingData {
  court_id: string
  client_id?: string
  start_time: string
  end_time: string
  status: BookingStatus
  amount: number
  payment_method: PaymentMethod
  cash_amount: number
  mercado_pago_amount: number
  hour_price: number
  deposit_amount: number
  notes?: string
}

export async function getBookings(date?: string, courtId?: string): Promise<Booking[]> {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (courtId) params.append('courtId', courtId)
  
  const url = `/api/bookings?${params.toString()}`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch bookings')
  }

  return response.json()
}

export async function getBooking(id: string): Promise<Booking> {
  const response = await fetch(`/api/bookings/${id}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch booking')
  }

  return response.json()
}

export async function createBooking(booking: CreateBookingData): Promise<Booking> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create booking')
  }

  return response.json()
}

export async function updateBooking(id: string, updates: Partial<CreateBookingData>): Promise<Booking> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update booking')
  }

  return response.json()
}

export async function deleteBooking(id: string): Promise<void> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete booking')
  }
}