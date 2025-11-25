// src/lib/api/sales.ts
import { db } from '@/lib/db'
import { addToSyncQueue } from '@/lib/sync'

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

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CONSUMO_INTERNO'

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
  if (date) {
    // Filter by date (assuming YYYY-MM-DD)
    // We need to query the index or filter in memory
    // Since we sync recent sales, filtering in memory is acceptable for now
    const allSales = await db.sales.toArray()
    return allSales.filter(s => s.created_at.startsWith(date))
  }
  return db.sales.toArray()
}

export async function createSale(saleData: SaleData): Promise<{ success: boolean; sale: Sale }> {
  // Create a local representation of the sale
  const newSale: Sale = {
    id: crypto.randomUUID(),
    total_amount: saleData.sale.total_amount,
    payment_method: saleData.sale.payment_method,
    client_id: saleData.sale.client_id || null,
    booking_id: saleData.bookingId || null,
    created_at: new Date().toISOString(),
    sale_items: saleData.items.map(item => ({
      id: crypto.randomUUID(),
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      created_at: new Date().toISOString(),
      // We might want to fetch product name here for UI consistency if needed
    }))
  }

  // Save to local DB
  await db.sales.add(newSale)

  // Queue for sync
  await addToSyncQueue('sales', 'CREATE', saleData)

  return { success: true, sale: newSale }
}

export async function deleteSale(id: string): Promise<void> {
  await db.sales.delete(id)
  await addToSyncQueue('sales', 'DELETE', { id })
}

export async function updateSale(id: string, updates: Partial<Sale>): Promise<Sale> {
  await db.sales.update(id, updates)
  const updatedSale = await db.sales.get(id)

  if (!updatedSale) throw new Error('Sale not found')

  await addToSyncQueue('sales', 'UPDATE', { id, ...updates })

  return updatedSale
}