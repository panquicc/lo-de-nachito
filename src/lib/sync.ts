import { db, SyncQueueItem } from './db'
import { fetchSalesFromApi, apiCreateSale, apiUpdateSale, apiDeleteSale } from './api/sales'
import { fetchProductsFromApi, apiCreateProduct, apiUpdateProduct, apiDeleteProduct } from './api/products'
import { fetchBookingsFromApi, apiCreateBooking, apiUpdateBooking, apiDeleteBooking } from './api/bookings'
import { fetchClientsFromApi, apiCreateClient, apiUpdateClient, apiDeleteClient } from './api/clients'
import { fetchExpensesFromApi, apiCreateExpense, apiUpdateExpense, apiDeleteExpense } from './api/expenses'
import { subDays, format } from 'date-fns'

export async function syncPull() {
    try {
        // 1. Sync Products (Full Sync)
        const products = await fetchProductsFromApi()
        await db.products.bulkPut(products)

        // 2. Sync Clients (Full Sync)
        const clients = await fetchClientsFromApi()
        await db.clients.bulkPut(clients)

        // 3. Sync Sales (Recent - last 30 days)
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
        const sales = await fetchSalesFromApi(startDate)
        await db.sales.bulkPut(sales)

        // 4. Sync Bookings (Recent - last 30 days + future)
        // Note: getBookings API might need adjustment to support date range or we fetch enough
        // For now assuming getBookings returns relevant future/recent bookings or we filter
        const bookings = await fetchBookingsFromApi(startDate)
        await db.bookings.bulkPut(bookings)

        // 5. Sync Expenses (Recent - last 30 days)
        // Assuming getExpenses supports some filtering or we fetch all if volume is low
        const expenses = await fetchExpensesFromApi() // You might want to filter this if possible
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
            if (item.action === 'CREATE') await apiCreateSale(item.data)
            if (item.action === 'UPDATE') await apiUpdateSale(item.data.id, item.data)
            if (item.action === 'DELETE') await apiDeleteSale(item.data.id)
            break
        case 'products':
            if (item.action === 'CREATE') await apiCreateProduct(item.data)
            if (item.action === 'UPDATE') await apiUpdateProduct(item.data.id, item.data)
            if (item.action === 'DELETE') await apiDeleteProduct(item.data.id)
            break
        case 'bookings':
            if (item.action === 'CREATE') await apiCreateBooking(item.data)
            if (item.action === 'UPDATE') await apiUpdateBooking(item.data.id, item.data)
            if (item.action === 'DELETE') await apiDeleteBooking(item.data.id)
            break
        case 'expenses':
            if (item.action === 'CREATE') await apiCreateExpense(item.data)
            if (item.action === 'UPDATE') await apiUpdateExpense(item.data.id, item.data)
            if (item.action === 'DELETE') await apiDeleteExpense(item.data.id)
            break
        case 'clients':
            if (item.action === 'CREATE') await apiCreateClient(item.data)
            if (item.action === 'UPDATE') await apiUpdateClient(item.data.id, item.data)
            if (item.action === 'DELETE') await apiDeleteClient(item.data.id)
            break
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
