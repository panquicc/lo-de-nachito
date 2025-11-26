import { db, SyncQueueItem } from './db'
import { fetchSalesFromApi, apiCreateSale, apiUpdateSale, apiDeleteSale } from './api/sales'
import { fetchProductsFromApi, apiCreateProduct, apiUpdateProduct, apiDeleteProduct } from './api/products'
import { fetchBookingsFromApi, apiCreateBooking, apiUpdateBooking, apiDeleteBooking } from './api/bookings'
import { fetchClientsFromApi, apiCreateClient, apiUpdateClient, apiDeleteClient } from './api/clients'
import { fetchExpensesFromApi, apiCreateExpense, apiUpdateExpense, apiDeleteExpense } from './api/expenses'
import { fetchCourtsFromApi } from './api/courts'
import { subDays, format } from 'date-fns'

export async function syncPull() {
    try {
        // 1. Sync Products (Full Sync)
        const products = await fetchProductsFromApi()
        await db.products.bulkPut(products)

        // 1.1 Sync Courts (Full Sync)
        const courts = await fetchCourtsFromApi()
        await db.courts.bulkPut(courts)

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
        } catch (error: any) {
            console.error(`Failed to process sync item ${item.id}:`, error)

            // Check for non-retriable errors (validation, stock, etc.)
            // If the error message indicates a logic error (not network/server error), remove from queue
            const errorMessage = error.message?.toLowerCase() || ''
            if (
                errorMessage.includes('stock insuficiente') ||
                errorMessage.includes('bad request') ||
                errorMessage.includes('400') ||
                errorMessage.includes('valid') // "no válido", "invalid", etc.
            ) {
                console.warn(`Removing invalid item ${item.id} from sync queue due to validation error:`, error.message)
                if (item.id) {
                    await db.syncQueue.delete(item.id)
                }

                // Revert local change to keep UI consistent
                try {
                    if (item.action === 'CREATE') {
                        // If creation failed, delete the local item
                        // We need to know the ID, which should be in item.data.id
                        if (item.data?.id) {
                            // @ts-ignore - dynamic table access
                            await db[item.table].delete(item.data.id)
                            console.log(`Reverted local creation of ${item.table} item ${item.data.id}`)
                        }
                    }
                    // For UPDATE/DELETE, reverting is harder without previous state. 
                    // Ideally we would store previous state in the queue item.
                    // For now, we accept that the UI might be slightly out of sync until next pull.
                } catch (revertError) {
                    console.error('Failed to revert local change:', revertError)
                }
            }
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
