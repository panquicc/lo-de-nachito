// src/hooks/useExpenses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExpenses, createExpense as apiCreateExpense, updateExpense as apiUpdateExpense, deleteExpense as apiDeleteExpense } from '@/lib/api/expenses'
import { UpdateExpenseDTO } from '@/types/expenses'
import { toast } from 'sonner'

export function useExpenses() {
    const queryClient = useQueryClient()

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => getExpenses()
    })

    const createExpense = useMutation({
        mutationFn: apiCreateExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] })
            toast.success('Gasto registrado correctamente')
        },
        onError: (error) => {
            console.error('Error creating expense:', error)
            toast.error('Error al registrar el gasto')
        }
    })

    const updateExpense = useMutation({
        mutationFn: ({ id, ...updates }: UpdateExpenseDTO) => apiUpdateExpense(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] })
            toast.success('Gasto actualizado correctamente')
        },
        onError: (error) => {
            console.error('Error updating expense:', error)
            toast.error('Error al actualizar el gasto')
        }
    })

    const deleteExpense = useMutation({
        mutationFn: apiDeleteExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] })
            toast.success('Gasto eliminado correctamente')
        },
        onError: (error) => {
            console.error('Error deleting expense:', error)
            toast.error('Error al eliminar el gasto')
        }
    })

    return {
        expenses,
        isLoading,
        createExpense,
        updateExpense,
        deleteExpense
    }
}