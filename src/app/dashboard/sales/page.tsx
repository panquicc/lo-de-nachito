// src/app/dashboard/sales/page.tsx
'use client'

import { useState, useEffect } from 'react'
import SalesFilters from '@/components/sales/SalesFilters'
import SalesHistoryTable from '@/components/sales/SalesHistoryTable'
import SalesStats from '@/components/sales/SalesStats'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SalesHistoryPage() {
    const [sales, setSales] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'TODOS',
        clientName: ''
    })

    useEffect(() => {
        fetchSales()
    }, [filters])

    const fetchSales = async () => {
        setIsLoading(true)
        try {
            const queryParams = new URLSearchParams()
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)
            if (filters.clientName) queryParams.append('clientName', filters.clientName)
            if (filters.paymentMethod && filters.paymentMethod !== 'TODOS') {
                queryParams.append('payment_method', filters.paymentMethod)
            }

            const response = await fetch(`/api/sales?${queryParams.toString()}`)
            if (!response.ok) throw new Error('Error fetching sales')

            const data = await response.json()
            setSales(data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFilterChange = (newFilters: { startDate: string; endDate: string; paymentMethod: string; clientName: string }) => {
        setFilters(newFilters)
    }

    const exportToCSV = () => {
        if (sales.length === 0) return

        const headers = ['Fecha', 'Cliente', 'Metodo de Pago', 'Total', 'Items']
        const csvContent = sales.map((sale: any) => {
            const items = sale.sale_items.map((item: any) =>
                `${item.quantity}x ${item.products?.name || 'Producto'} `
            ).join('; ')

            return [
                new Date(sale.created_at).toLocaleString(),
                sale.clients?.name || 'Consumidor Final',
                sale.payment_method,
                sale.total_amount.toFixed(2),
                `"${items}"` // Quote items to handle commas/semicolons
            ].join(',')
        })

        const csvString = [headers.join(','), ...csvContent].join('\n')
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Ventas</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus ventas, consulta métricas y exporta reportes.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={exportToCSV}
                        disabled={sales.length === 0}
                        className="flex-1 sm:flex-none"
                    >
                        <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Link href="/dashboard/kiosk" className="flex-1 sm:flex-none">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Venta
                        </Button>
                    </Link>
                </div>
            </div>

            <SalesStats sales={sales} />

            <div className="space-y-4">
                <SalesFilters onFilterChange={handleFilterChange} />
                <SalesHistoryTable sales={sales} isLoading={isLoading} />
            </div>
        </div>
    )
}

