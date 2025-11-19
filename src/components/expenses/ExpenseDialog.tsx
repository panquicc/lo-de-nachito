// src/components/expenses/ExpenseDialog.tsx

'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import ExpenseForm from './ExpenseForm'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExpenses } from '@/hooks/useExpenses'
import { Expense, CreateExpenseDTO } from '@/types/expenses'

interface ExpenseDialogProps {
    variant: 'create' | 'edit'
    expense?: Expense
}

export default function ExpenseDialog({ variant, expense }: ExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const { createExpense, updateExpense } = useExpenses()

    const isEdit = variant === 'edit'

    const handleSubmit = async (data: CreateExpenseDTO) => {
        try {
            if (isEdit && expense) {
                await updateExpense.mutateAsync({
                    id: expense.id,
                    ...data,
                })
            } else {
                await createExpense.mutateAsync(data)
            }
            setOpen(false)
        } catch (error) {
            // Error handling is done in the hook
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                        <Plus className="h-4 w-4" />
                        Nuevo Gasto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                    </DialogTitle>
                </DialogHeader>
                <ExpenseForm
                    initialData={expense}
                    onSubmit={handleSubmit}
                    onCancel={() => setOpen(false)}
                    isSubmitting={createExpense.isPending || updateExpense.isPending}
                />
            </DialogContent>
        </Dialog>
    )
}