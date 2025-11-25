// src/components/sales/SalesHistoryTable.tsx
'use client'

import { useState, Fragment } from 'react'

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

    if (isLoading) {
        return <div className="text-center py-8">Cargando ventas...</div>
    }

    if (sales.length === 0) {
        return <div className="text-center py-8 text-gray-500">No se encontraron ventas para los filtros seleccionados.</div>
    }

    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                                Detalles
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sales.map((sale) => (
                            <Fragment key={sale.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(sale.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {sale.clients?.name || 'Consumidor Final'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${sale.payment_method === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                                                sale.payment_method === 'TARJETA' ? 'bg-blue-100 text-blue-800' :
                                                    sale.payment_method === 'TRANSFERENCIA' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {sale.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                        ${sale.total_amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <button
                                            onClick={() => toggleExpand(sale.id)}
                                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                                        >
                                            {expandedSaleId === sale.id ? 'Ocultar' : 'Ver'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedSaleId === sale.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                <h4 className="font-medium mb-2">Items de la venta:</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {sale.sale_items.map((item, index) => (
                                                        <li key={index}>
                                                            {item.quantity}x {item.products?.name || 'Producto desconocido'} - ${item.unit_price.toFixed(2)} c/u
                                                        </li>
                                                    ))}
                                                </ul>
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
