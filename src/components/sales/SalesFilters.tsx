// src/components/sales/SalesFilters.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Search, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SalesFiltersProps {
    onFilterChange: (filters: { startDate: string; endDate: string; paymentMethod: string; clientName: string }) => void
}

export default function SalesFilters({ onFilterChange }: SalesFiltersProps) {
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [paymentMethod, setPaymentMethod] = useState<string>('TODOS')
    const [clientName, setClientName] = useState<string>('')

    // Debounce for client search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange({ clientName })
        }, 500)
        return () => clearTimeout(timer)
    }, [clientName])

    const handleFilterChange = (updates: Partial<{ startDate: string; endDate: string; paymentMethod: string; clientName: string }>) => {
        const newFilters = { startDate, endDate, paymentMethod, clientName, ...updates }

        // Only update state if it's not the clientName (handled by useEffect) or if it comes from direct interaction
        if (updates.startDate) setStartDate(updates.startDate)
        if (updates.endDate) setEndDate(updates.endDate)
        if (updates.paymentMethod) setPaymentMethod(updates.paymentMethod)

        onFilterChange(newFilters)
    }

    const setDateRange = (range: 'today' | 'yesterday' | 'week' | 'month') => {
        const today = new Date()
        let start = new Date()
        let end = new Date()

        switch (range) {
            case 'today':
                // start and end are already today
                break
            case 'yesterday':
                start.setDate(today.getDate() - 1)
                end.setDate(today.getDate() - 1)
                break
            case 'week':
                start.setDate(today.getDate() - 7)
                break
            case 'month':
                start.setDate(1) // First day of current month
                break
        }

        const startStr = start.toISOString().split('T')[0]
        const endStr = end.toISOString().split('T')[0]

        setStartDate(startStr)
        setEndDate(endStr)
        handleFilterChange({ startDate: startStr, endDate: endStr })
    }

    const clearFilters = () => {
        const today = new Date().toISOString().split('T')[0]
        setStartDate(today)
        setEndDate(today)
        setPaymentMethod('TODOS')
        setClientName('')
        onFilterChange({ startDate: today, endDate: today, paymentMethod: 'TODOS', clientName: '' })
    }

    return (
        <Card className="bg-white">
            <CardContent className="p-4 space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => setDateRange('today')}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('yesterday')}>
                        Ayer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('week')}>
                        Últimos 7 días
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange('month')}>
                        Este Mes
                    </Button>
                    {(startDate !== new Date().toISOString().split('T')[0] || paymentMethod !== 'TODOS' || clientName) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <X className="h-4 w-4 mr-1" /> Limpiar Filtros
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-xs font-medium text-gray-500 uppercase">
                            Fecha Desde
                        </Label>
                        <div className="relative">
                            <Input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-xs font-medium text-gray-500 uppercase">
                            Fecha Hasta
                        </Label>
                        <div className="relative">
                            <Input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clientName" className="text-xs font-medium text-gray-500 uppercase">
                            Cliente
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                type="text"
                                id="clientName"
                                placeholder="Buscar por nombre..."
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod" className="text-xs font-medium text-gray-500 uppercase">
                            Método de Pago
                        </Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value) => handleFilterChange({ paymentMethod: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODOS">Todos</SelectItem>
                                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                <SelectItem value="TARJETA">Tarjeta</SelectItem>
                                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                                <SelectItem value="CONSUMO_INTERNO">Consumo Interno</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
