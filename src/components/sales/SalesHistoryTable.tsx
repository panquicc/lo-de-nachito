// src/components/sales/SalesHistoryTable.tsx
'use client'

import { useState, Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Trash2, Pencil, AlertTriangle, Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { deleteSale, updateSale } from '@/lib/api/sales'
import { toast } from 'sonner'
import { ClientSelector } from '../kiosk/ClientSelector'

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
    client_id: string | null
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

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Edit State
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [editForm, setEditForm] = useState({
        payment_method: '',
        client_id: undefined as string | undefined
    })

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

    // Delete Handlers
    const confirmDelete = (sale: Sale) => {
        setSaleToDelete(sale)
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!saleToDelete) return

        setIsDeleting(true)
        try {
            await deleteSale(saleToDelete.id)
            toast.success('Venta eliminada correctamente')
            setDeleteDialogOpen(false)
            // Recargar la página para reflejar cambios (o usar react-query invalidate)
            window.location.reload()
        } catch (error) {
            toast.error('Error al eliminar la venta')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    // Edit Handlers
    const openEditDialog = (sale: Sale) => {
        setSaleToEdit(sale)
        setEditForm({
            payment_method: sale.payment_method,
            client_id: sale.client_id || undefined
        })
        setEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!saleToEdit) return

        setIsUpdating(true)
        try {
            await updateSale(saleToEdit.id, {
                payment_method: editForm.payment_method as any,
                client_id: editForm.client_id || null
            })
            toast.success('Venta actualizada correctamente')
            setEditDialogOpen(false)
            window.location.reload()
        } catch (error) {
            toast.error('Error al actualizar la venta')
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return <div className="text-center py-12 text-gray-500">Cargando historial de ventas...</div>
    }

    if (sales.length === 0) {
        return <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">No se encontraron ventas para los filtros seleccionados.</div>
    }

    return (
        <>
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
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExpand(sale.id)}
                                                    className="h-8 w-8 p-0"
                                                    title="Ver detalles"
                                                >
                                                    {expandedSaleId === sale.id ? (
                                                        <ChevronUp className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditDialog(sale)}
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Editar venta"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => confirmDelete(sale)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Eliminar venta"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            ¿Estás seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la venta permanentemente y
                            <span className="font-bold text-gray-900"> se restaurará el stock </span>
                            de los productos involucrados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar Venta'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Venta</DialogTitle>
                        <DialogDescription>
                            Modifica los detalles de la venta. Los cambios se guardarán inmediatamente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Método de Pago</Label>
                            <Select
                                value={editForm.payment_method}
                                onValueChange={(v) => setEditForm({ ...editForm, payment_method: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                                    <SelectItem value="CONSUMO_INTERNO">Consumo Interno</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <ClientSelector
                                selectedClientId={editForm.client_id}
                                onClientSelect={(id) => setEditForm({ ...editForm, client_id: id })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
