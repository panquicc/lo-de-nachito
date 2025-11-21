// src/components/sales/SalesFilter.tsx
'use client'

import { useState } from 'react'

interface SalesFiltersProps {
    onFilterChange: (filters: { startDate: string; endDate: string; paymentMethod: string; clientName: string }) => void
}

export default function SalesFilters({ onFilterChange }: SalesFiltersProps) {
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [paymentMethod, setPaymentMethod] = useState<string>('TODOS')
    const [clientName, setClientName] = useState<string>('')

    const handleFilterChange = (updates: Partial<{ startDate: string; endDate: string; paymentMethod: string; clientName: string }>) => {
        const newFilters = { startDate, endDate, paymentMethod, clientName, ...updates }

        if (updates.startDate) setStartDate(updates.startDate)
        if (updates.endDate) setEndDate(updates.endDate)
        if (updates.paymentMethod) setPaymentMethod(updates.paymentMethod)
        if (updates.clientName !== undefined) setClientName(updates.clientName)

        onFilterChange(newFilters)
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Desde
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Hasta
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente
                    </label>
                    <input
                        type="text"
                        id="clientName"
                        placeholder="Buscar por nombre..."
                        value={clientName}
                        onChange={(e) => handleFilterChange({ clientName: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pago
                    </label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => handleFilterChange({ paymentMethod: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="CONSUMO_INTERNO">Consumo Interno</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
