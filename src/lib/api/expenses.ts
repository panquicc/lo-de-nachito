// src/lib/api/expenses.ts
import { Expense, CreateExpenseDTO } from '@/types/expenses'

export async function getExpenses(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Expense[]> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.category) params.append('category', filters.category)

    const url = `/api/expenses?${params.toString()}`

    const response = await fetch(url)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch expenses')
    }

    return response.json()
}

export async function createExpense(expense: CreateExpenseDTO): Promise<Expense> {
    const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create expense')
    }

    return response.json()
}

export async function updateExpense(id: string, updates: Partial<CreateExpenseDTO>): Promise<Expense> {
    const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update expense')
    }

    return response.json()
}

export async function deleteExpense(id: string): Promise<void> {
    const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete expense')
    }
}
