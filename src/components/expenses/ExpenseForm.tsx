// src/components/expenses/ExpenseForm.tsx
'use client'

import { Expense, CreateExpenseDTO, ExpenseCategory } from '@/types/expenses'
import { InputMoneda } from '@/components/ui/input-moneda'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import * as z from 'zod'

const expenseSchema = z.object({
    description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    category: z.enum(['maintenance', 'supplies', 'utilities', 'salary', 'other']),
    date: z.string().min(1, 'La fecha es requerida'),
    notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
    initialData?: Expense
    onSubmit: (data: CreateExpenseDTO) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'supplies', label: 'Insumos' },
    { value: 'utilities', label: 'Servicios' },
    { value: 'salary', label: 'Sueldos' },
    { value: 'other', label: 'Otros' },
]

export default function ExpenseForm({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false
}: ExpenseFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: initialData?.description || '',
            amount: initialData?.amount || 0,
            category: initialData?.category,
            date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            notes: initialData?.notes || '',
        },
    })

    const handleFormSubmit = async (data: ExpenseFormData) => {
        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                    id="description"
                    placeholder="Ej: Compra de artículos de limpieza"
                    {...register('description')}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <InputMoneda
                        label="Monto"
                        value={watch('amount')}
                        onChange={(value) => setValue('amount', value, { shouldValidate: true })}
                        required={true}
                    />
                    {errors.amount && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                        id="date"
                        type="date"
                        {...register('date')}
                    />
                    {errors.date && (
                        <p className="text-sm text-red-500">{errors.date.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                    onValueChange={(value) => setValue('category', value as ExpenseCategory)}
                    defaultValue={initialData?.category}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                    id="notes"
                    placeholder="Detalles adicionales..."
                    className="resize-none"
                    {...register('notes')}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Registrar'}
                </Button>
            </div>
        </form>
    )
}