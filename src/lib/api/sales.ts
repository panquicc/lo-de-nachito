// src/lib/api/sales.ts
export interface Sale {
  id: string
  total_amount: number
  payment_method: PaymentMethod
  client_id: string | null
  booking_id: string | null
  created_at: string
  sale_items?: SaleItem[]
  clients?: {
    name: string
    email: string
  }
}

export interface SaleItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  products?: {
    name: string
  }
}

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

export interface SaleData {
  sale: {
    total_amount: number
    payment_method: PaymentMethod
    client_id?: string
  }
  items: {
    product_id: string
    quantity: number
    unit_price: number
  }[]
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

export async function createSale(saleData: SaleData): Promise<{ success: boolean; sale: Sale }> {
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