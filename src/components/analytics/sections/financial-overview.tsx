// src/components/analytics/sections/financial-overview.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRange } from 'react-day-picker'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface FinancialData {
    summary: {
        totalRevenue: number
        bookingRevenue: number
        productRevenue: number
        productCosts: number
        netProfit: number
        totalBookings: number
        totalSales: number
    }
    byPaymentMethod: {
        [key: string]: number
    }
    dailyBreakdown: Array<{
        date: string
        revenue: number
        bookings: number
        salesCount: number
        costs: number
    }>
}

export function FinancialOverview({ dateRange }: { dateRange: DateRange }) {
    const [data, setData] = useState<FinancialData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchFinancialData()
    }, [dateRange])

    const fetchFinancialData = async () => {
        if (!dateRange.from || !dateRange.to) return

        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                startDate: format(dateRange.from, 'yyyy-MM-dd'),
                endDate: format(dateRange.to, 'yyyy-MM-dd')
            })

            const response = await fetch(`/api/analytics/financial?${params}`)

            if (!response.ok) {
                throw new Error('Error al cargar los datos financieros')
            }

            const financialData = await response.json()
            setData(financialData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <FinancialOverviewSkeleton />
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p>Error: {error}</p>
                <button
                    onClick={fetchFinancialData}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-6 text-center text-gray-500">
                No hay datos disponibles para el período seleccionado
            </div>
        )
    }

    const { summary, byPaymentMethod } = data

    return (
        <div className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Ingresos Totales"
                    value={summary.totalRevenue}
                    format="currency"
                    description="Ingresos brutos del período"
                    trend={10} // Podríamos calcular esto comparando con período anterior
                />
                <MetricCard
                    title="Ganancia Neta"
                    value={summary.netProfit}
                    format="currency"
                    description="Después de costos"
                    trend={8}
                />
                <MetricCard
                    title="Total Turnos"
                    value={summary.totalBookings}
                    format="number"
                    description="Reservas confirmadas"
                    trend={5}
                />
                <MetricCard
                    title="Ventas Kiosco"
                    value={summary.totalSales}
                    format="number"
                    description="Transacciones en kiosco"
                    trend={12}
                />
            </div>

            {/* Desglose de Ingresos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Ingresos por Fuente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Turnos/Reservas:</span>
                                <span className="font-medium">
                                    {formatCurrency(summary.bookingRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Ventas Kiosco:</span>
                                <span className="font-medium">
                                    {formatCurrency(summary.productRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-sm font-medium">Total:</span>
                                <span className="font-bold">
                                    {formatCurrency(summary.totalRevenue)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Métodos de Pago</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(byPaymentMethod).map(([method, amount]) => (
                                <div key={method} className="flex justify-between">
                                    <span className="text-sm capitalize">{method.toLowerCase()}:</span>
                                    <span className="font-medium">
                                        {formatCurrency(amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Rentabilidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Ingresos Kiosco:</span>
                                <span className="font-medium">
                                    {formatCurrency(summary.productRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Costos Kiosco:</span>
                                <span className="font-medium text-red-600">
                                    -{formatCurrency(summary.productCosts)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-sm font-medium">Margen Kiosco:</span>
                                <span className={`font-bold ${(summary.productRevenue - summary.productCosts) >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}>
                                    {formatCurrency(summary.productRevenue - summary.productCosts)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Componente para mostrar métricas individuales
interface MetricCardProps {
    title: string
    value: number
    format: 'currency' | 'number'
    description: string
    trend?: number
}

function MetricCard({ title, value, format, description, trend }: MetricCardProps) {
    const formattedValue = format === 'currency' ? formatCurrency(value) : value.toLocaleString()

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {trend && (
                    <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedValue}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

// Esqueleto de carga
function FinancialOverviewSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-8" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/2 mb-1" />
                            <Skeleton className="h-3 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex justify-between">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// Utilidad para formatear moneda
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(amount)
}