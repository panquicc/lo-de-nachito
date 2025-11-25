'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CreditCard, ShoppingBag, TrendingUp } from 'lucide-react'

interface Sale {
    id: string
    total_amount: number
    payment_method: string
}

interface SalesStatsProps {
    sales: Sale[]
}

export default function SalesStats({ sales }: SalesStatsProps) {
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
    const totalSales = sales.length
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

    // Calculate top payment method
    const paymentMethods = sales.reduce((acc, sale) => {
        acc[sale.payment_method] = (acc[sale.payment_method] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const topPaymentMethod = Object.entries(paymentMethods).sort((a, b) => b[1] - a[1])[0]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                        En el periodo seleccionado
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSales}</div>
                    <p className="text-xs text-muted-foreground">
                        Transacciones realizadas
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
                    <p className="text-xs text-muted-foreground">
                        Promedio por venta
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Método Frecuente</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold truncate">
                        {topPaymentMethod ? topPaymentMethod[0] : '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {topPaymentMethod ? `${topPaymentMethod[1]} transacciones` : 'Sin datos'}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
