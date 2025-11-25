// src/lib/api/bookings.ts
import { db } from '@/lib/db'
import { addToSyncQueue } from '@/lib/sync'
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
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY'
    interval?: number
    daysOfWeek?: number[]
    endDate?: string
    occurrences?: number
  }
}

export async function getBookings(date?: string, courtId?: string): Promise<Booking[]> {
  let bookings = await db.bookings.toArray()

  if (date) {
    // Filter by date (assuming start_time is ISO string)
    bookings = bookings.filter(b => b.start_time.startsWith(date))
  }

  if (courtId) {
    bookings = bookings.filter(b => b.court_id === courtId)
  }

  return bookings
}

export async function fetchBookingsFromApi(date?: string): Promise<Booking[]> {
  const params = new URLSearchParams()
  if (date) params.append('date', date) // Adjust param name if needed based on API

  const response = await fetch(`/api/bookings?${params.toString()}`)
  if (!response.ok) throw new Error('Failed to fetch bookings from API')
  return response.json()
}

export async function getBooking(id: string): Promise<Booking> {
  const booking = await db.bookings.get(id)
  if (!booking) throw new Error('Booking not found')
  return booking
}

export async function createBooking(bookingData: CreateBookingData): Promise<Booking> {
  const newBooking: Booking = {
    id: crypto.randomUUID(),
    court_id: bookingData.court_id,
    client_id: bookingData.client_id,
    start_time: bookingData.start_time,
    end_time: bookingData.end_time,
    status: bookingData.status,
    amount: bookingData.amount,
    payment_method: bookingData.payment_method,
    cash_amount: bookingData.cash_amount,
    mercado_pago_amount: bookingData.mercado_pago_amount,
    hour_price: bookingData.hour_price,
    deposit_amount: bookingData.deposit_amount,
    notes: bookingData.notes,
    created_at: new Date().toISOString(),
    // clients and courts might need to be fetched or mocked if needed for UI
  }

  await db.bookings.add(newBooking)
  await addToSyncQueue('bookings', 'CREATE', bookingData)

  return newBooking
}

export async function updateBooking(id: string, updates: Partial<CreateBookingData>): Promise<Booking> {
  await db.bookings.update(id, updates as any) // Type casting as updates might not match Booking exactly
  const updatedBooking = await db.bookings.get(id)

  if (!updatedBooking) throw new Error('Booking not found')

  await addToSyncQueue('bookings', 'UPDATE', { id, ...updates })

  return updatedBooking
}

export async function deleteBooking(id: string): Promise<void> {
  await db.bookings.delete(id)
  await addToSyncQueue('bookings', 'DELETE', { id })
}

export async function apiCreateBooking(bookingData: CreateBookingData): Promise<Booking> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create booking in API')
  }
  return response.json()
}

export async function apiUpdateBooking(id: string, updates: Partial<CreateBookingData>): Promise<Booking> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update booking in API')
  }
  return response.json()
}

export async function apiDeleteBooking(id: string): Promise<void> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete booking in API')
  }
}