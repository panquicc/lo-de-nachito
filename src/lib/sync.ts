import { db, SyncQueueItem } from './db'
import { getSales, createSale, updateSale, deleteSale } from './api/sales'
import { getProducts, createProduct, updateProduct, deleteProduct } from './api/products'
import { getBookings, createBooking, updateBooking, deleteBooking } from './api/bookings'
import { getClients } from './api/clients'
import { getExpenses } from './api/expenses'
import { subDays, format } from 'date-fns'

export async function syncPull() {
    try {
        // 1. Sync Products (Full Sync)
        const products = await getProducts()
        await db.products.bulkPut(products)

        // 2. Sync Clients (Full Sync)
        const clients = await getClients()
        await db.clients.bulkPut(clients)

        // 3. Sync Sales (Recent - last 30 days)
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
        const sales = await getSales(startDate)
        await db.sales.bulkPut(sales)

        // 4. Sync Bookings (Recent - last 30 days + future)
        // Note: getBookings API might need adjustment to support date range or we fetch enough
        // For now assuming getBookings returns relevant future/recent bookings or we filter
        const bookings = await getBookings(startDate)
        await db.bookings.bulkPut(bookings)

        // 5. Sync Expenses (Recent - last 30 days)
        // Assuming getExpenses supports some filtering or we fetch all if volume is low
        const expenses = await getExpenses() // You might want to filter this if possible
        await db.expenses.bulkPut(expenses)

        console.log('Pull sync completed successfully')
    } catch (error) {
        console.error('Pull sync failed:', error)
        throw error
    }
}

export async function syncPush() {
    const queue = await db.syncQueue.toArray()
    if (queue.length === 0) return

    for (const item of queue) {
        try {
            await processQueueItem(item)
            if (item.id) {
                await db.syncQueue.delete(item.id)
            }
        } catch (error) {
            console.error(`Failed to process sync item ${item.id}:`, error)
            // Keep in queue to retry later? Or move to a 'failed' queue?
            // For now, we leave it. In a real app, we might need a retry count.
        }
    }
}

async function processQueueItem(item: SyncQueueItem) {
    switch (item.table) {
        case 'sales':
            if (item.action === 'CREATE') await createSale(item.data)
            if (item.action === 'UPDATE') await updateSale(item.data.id, item.data)
            if (item.action === 'DELETE') await deleteSale(item.data.id)
            break
        case 'products':
            if (item.action === 'CREATE') await createProduct(item.data)
            if (item.action === 'UPDATE') await updateProduct(item.data.id, item.data)
            if (item.action === 'DELETE') await deleteProduct(item.data.id)
            break
        case 'bookings':
            if (item.action === 'CREATE') await createBooking(item.data)
            if (item.action === 'UPDATE') await updateBooking(item.data.id, item.data)
            if (item.action === 'DELETE') await deleteBooking(item.data.id)
            break
        // Add other cases as needed
    }
}

export async function addToSyncQueue(
    table: SyncQueueItem['table'],
    action: SyncQueueItem['action'],
    data: any
) {
    await db.syncQueue.add({
        table,
        action,
        data,
        timestamp: Date.now(),
    })

    // Try to sync immediately if online
    if (navigator.onLine) {
        syncPush()
    }
}
