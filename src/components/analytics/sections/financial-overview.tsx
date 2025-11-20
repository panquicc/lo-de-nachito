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
        internalConsumptionCosts: number
        totalExpenses: number
        netProfit: number
        totalBookings: number
        totalSales: number
        totalExpensesCount: number
    }
    byPaymentMethod: {
        [key: string]: number
    }
    expensesByCategory: {
        [key: string]: number
    }
    dailyBreakdown: Array<{
        date: string
        revenue: number
        bookings: number
        salesCount: number
        costs: number
        expenses: number
    }>
}

const CATEGORY_LABELS: Record<string, string> = {
    maintenance: 'Mantenimiento',
    supplies: 'Insumos',
    utilities: 'Servicios',
    salary: 'Sueldos',
    other: 'Otros',
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

    const { summary, byPaymentMethod, expensesByCategory } = data

    return (
        <div className="space-y-6">
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Ingresos Totales"
                    value={summary.totalRevenue}
                    format="currency"
                    description="Ingresos brutos del período"
                    trend={10}
                />
                <MetricCard
                    title="Gastos Operativos"
                    value={summary.totalExpenses}
                    format="currency"
                    description={`${summary.totalExpensesCount} gastos registrados`}
                    trend={-5}
                    inverseTrend
                />
                <MetricCard
                    title="Ganancia Neta"
                    value={summary.netProfit}
                    format="currency"
                    description="Después de costos y gastos"
                    trend={8}
                />
                <MetricCard
                    title="Total Turnos"
                    value={summary.totalBookings}
                    format="number"
                    description="Reservas confirmadas"
                    trend={5}
                />
            </div>

            {/* Desglose de Ingresos y Gastos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Flujo de Caja</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm">Ingresos Turnos:</span>
                                <span className="font-medium text-green-600">
                                    +{formatCurrency(summary.bookingRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Ingresos Kiosco:</span>
                                <span className="font-medium text-green-600">
                                    +{formatCurrency(summary.productRevenue)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Costos Ventas:</span>
                                <span className="font-medium text-red-600">
                                    -{formatCurrency(summary.productCosts - (summary.internalConsumptionCosts || 0))}
                                </span>
                            </div>
                            {summary.internalConsumptionCosts > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm">Costo Consumo Interno:</span>
                                    <span className="font-medium text-orange-600">
                                        -{formatCurrency(summary.internalConsumptionCosts)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm">Gastos Operativos:</span>
                                <span className="font-medium text-red-600">
                                    -{formatCurrency(summary.totalExpenses)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                                <span className="text-sm font-medium">Resultado Neto:</span>
                                <span className={`font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(summary.netProfit)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Gastos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(expensesByCategory).length > 0 ? (
                                Object.entries(expensesByCategory)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([category, amount]) => (
                                        <div key={category} className="flex justify-between">
                                            <span className="text-sm capitalize">{CATEGORY_LABELS[category] || category}:</span>
                                            <span className="font-medium">
                                                {formatCurrency(amount)}
                                            </span>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-2">No hay gastos registrados</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Métodos de Pago (Ingresos)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(byPaymentMethod).map(([method, amount]) => (
                                <div key={method} className="flex justify-between">
                                    <span className="text-sm capitalize">{method.toLowerCase().replace('_', ' ')}:</span>
                                    <span className="font-medium">
                                        {formatCurrency(amount)}
                                    </span>
                                </div>
                            ))}
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
    inverseTrend?: boolean
}

function MetricCard({ title, value, format, description, trend, inverseTrend }: MetricCardProps) {
    const formattedValue = format === 'currency' ? formatCurrency(value) : value.toLocaleString()

    // Si inverseTrend es true, un trend positivo es malo (rojo) y negativo es bueno (verde)
    const isPositiveTrendGood = !inverseTrend
    const isTrendPositive = trend && trend >= 0
    const trendColor = isTrendPositive
        ? (isPositiveTrendGood ? 'text-green-600' : 'text-red-600')
        : (isPositiveTrendGood ? 'text-red-600' : 'text-green-600')

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {trend !== undefined && (
                    <span className={`text-xs ${trendColor}`}>
                        {trend > 0 ? '+' : ''}{trend}%
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