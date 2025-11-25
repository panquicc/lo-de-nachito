// src/lib/api/expenses.ts
import { db } from '@/lib/db'
import { addToSyncQueue } from '@/lib/sync'
import { Expense, CreateExpenseDTO } from '@/types/expenses'

export async function getExpenses(filters?: { startDate?: string; endDate?: string; category?: string }): Promise<Expense[]> {
    let expenses = await db.expenses.toArray()

    if (filters?.startDate) {
        expenses = expenses.filter(e => e.date >= filters.startDate!)
    }
    if (filters?.endDate) {
        expenses = expenses.filter(e => e.date <= filters.endDate!)
    }
    if (filters?.category) {
        expenses = expenses.filter(e => e.category === filters.category)
    }

    return expenses
}

export async function createExpense(expenseData: CreateExpenseDTO): Promise<Expense> {
    const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        created_by: 'local-user', // Placeholder, ideally we get the current user
    }

    await db.expenses.add(newExpense)
    await addToSyncQueue('expenses', 'CREATE', newExpense)

    return newExpense
}

export async function updateExpense(id: string, updates: Partial<CreateExpenseDTO>): Promise<Expense> {
    await db.expenses.update(id, updates)
    const updatedExpense = await db.expenses.get(id)

    if (!updatedExpense) throw new Error('Expense not found')

    await addToSyncQueue('expenses', 'UPDATE', { id, ...updates })

    return updatedExpense
}

export async function deleteExpense(id: string): Promise<void> {
    await db.expenses.delete(id)
    await addToSyncQueue('expenses', 'DELETE', { id })
}
