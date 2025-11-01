// src/lib/api/sales.ts
import { Client } from './clients'

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

export type SaleItem = {
  product_id: string
  quantity: number
  unit_price: number
  products?: {
    name: string
  }
}

export type Sale = {
  id: string
  total_amount: number
  payment_method: PaymentMethod
  client_id?: string
  created_at: string
  clients?: Client
  sale_items: (SaleItem & { id: string })[]
}

export type CreateSaleData = {
  sale: {
    total_amount: number
    payment_method: PaymentMethod
    client_id?: string
  }
  items: SaleItem[]
  bookingId?: string
}

export async function getSales(date?: string): Promise<Sale[]> {
  const url = date ? `/api/sales?date=${date}` : '/api/sales'
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch sales')
  }

  return response.json()
}

export async function createSale(saleData: CreateSaleData): Promise<Sale> {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(saleData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create sale')
  }

  return response.json()
}