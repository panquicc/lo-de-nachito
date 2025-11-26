import Dexie, { Table } from 'dexie'
import { Sale } from './api/sales'
import { Product } from './api/products'
import { Booking } from './api/bookings'
import { Client } from './api/clients'
import { Expense } from '@/types/expenses'

export interface SyncQueueItem {
    id?: number
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    table: 'sales' | 'products' | 'bookings' | 'clients' | 'expenses'
    data: any
    timestamp: number
}

export class AppDatabase extends Dexie {
    sales!: Table<Sale, string>
    products!: Table<Product, string>
    bookings!: Table<Booking, string>
    clients!: Table<Client, string>
    expenses!: Table<Expense, string>
    courts!: Table<any, string> // We'll type this properly in courts.ts or here if circular dep issues
    syncQueue!: Table<SyncQueueItem, number>

    constructor() {
        super('LoDeNachitoDB')
        this.version(1).stores({
            sales: 'id, created_at, client_id, payment_method',
            products: 'id, name, is_active',
            bookings: 'id, start_time, court_id, client_id, status',
            clients: 'id, name, email',
            expenses: 'id, date, category',
            courts: 'id, name, is_active',
            syncQueue: '++id, table, action, timestamp'
        })
    }
}

export const db = new AppDatabase()
