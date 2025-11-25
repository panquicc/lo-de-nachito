// src/components/sales/SalesHistoryTable.tsx
'use client'

import { useState, Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SaleItem {
    quantity: number
    unit_price: number
    products: {
        name: string
    }
}

interface Sale {
    id: string
    created_at: string
    total_amount: number
    payment_method: string
    clients?: {
        name: string
    }
    sale_items: SaleItem[]
}

interface SalesHistoryTableProps {
    sales: Sale[]
    isLoading: boolean
}

export default function SalesHistoryTable({ sales, isLoading }: SalesHistoryTableProps) {
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)

    const toggleExpand = (saleId: string) => {
        setExpandedSaleId(expandedSaleId === saleId ? null : saleId)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(price)
    }

    const getPaymentMethodBadge = (method: string) => {
        switch (method) {
            case 'EFECTIVO':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Efectivo</Badge>
            case 'TARJETA':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Tarjeta</Badge>
            case 'TRANSFERENCIA':
                return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">Transferencia</Badge>
            case 'CONSUMO_INTERNO':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">Consumo Interno</Badge>
            default:
                return <Badge variant="outline">{method}</Badge>
        }
    }

    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Cargando historial de ventas...</div>
    }

    if (sales.length === 0) {
        return <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">No se encontraron ventas para los filtros seleccionados.</div>
    }

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Método de Pago
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map((sale) => (
                            <Fragment key={sale.id}>
                                <tr className={`hover:bg-gray-50 transition-colors ${expandedSaleId === sale.id ? 'bg-gray-50/50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(sale.created_at).toLocaleString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {sale.clients?.name ? (
                                            <span className="font-medium text-gray-900">{sale.clients.name}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Consumidor Final</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getPaymentMethodBadge(sale.payment_method)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                                        {formatPrice(sale.total_amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpand(sale.id)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {expandedSaleId === sale.id ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </td>
                                </tr>
                                {expandedSaleId === sale.id && (
                                    <tr className="bg-gray-50/50">
                                        <td colSpan={5} className="px-6 py-4 border-t border-gray-100">
                                            <div className="bg-white rounded-md border p-4 shadow-sm max-w-3xl mx-auto">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">Detalle de la Venta</h4>
                                                <div className="space-y-2">
                                                    {sale.sale_items.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-900">{item.quantity}x</span>
                                                                <span className="text-gray-600">{item.products?.name || 'Producto eliminado'}</span>
                                                            </div>
                                                            <span className="text-gray-900 font-medium">
                                                                {formatPrice(item.unit_price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-3 border-t flex justify-between items-center bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-md">
                                                    <span className="font-semibold text-gray-700">Total Final</span>
                                                    <span className="font-bold text-lg text-gray-900">{formatPrice(sale.total_amount)}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
