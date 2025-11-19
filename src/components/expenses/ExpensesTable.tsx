// src/components/expenses/ExpensesTable.tsx
'use client'

import { useState } from 'react'
import { useExpenses } from '@/hooks/useExpenses'
import { ExpenseCategory } from '@/types/expenses'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Loader2 } from 'lucide-react'
import ExpenseDialog from './ExpenseDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    maintenance: 'Mantenimiento',
    supplies: 'Insumos',
    utilities: 'Servicios',
    salary: 'Sueldos',
    other: 'Otros',
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    maintenance: 'bg-blue-100 text-blue-800',
    supplies: 'bg-green-100 text-green-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    salary: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
}

export default function ExpensesTable() {
    const { expenses, isLoading, deleteExpense } = useExpenses()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return

        setDeletingId(id)
        try {
            await deleteExpense.mutateAsync(id)
        } finally {
            setDeletingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!expenses || expenses.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No hay gastos registrados</p>
                <p className="text-sm text-gray-400 mt-1">
                    Comienza registrando tu primer gasto
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell className="font-medium">
                                    {format(new Date(expense.date), 'dd/MM/yyyy', { locale: es })}
                                </TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell>
                                    <Badge className={CATEGORY_COLORS[expense.category]}>
                                        {CATEGORY_LABELS[expense.category]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    ${expense.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-gray-600">
                                    {expense.notes || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <ExpenseDialog variant="edit" expense={expense} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(expense.id)}
                                            disabled={deletingId === expense.id}
                                        >
                                            {deletingId === expense.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}