// src/types/expenses.ts
export type ExpenseCategory = 'maintenance' | 'supplies' | 'utilities' | 'salary' | 'other'

export interface Expense {
    id: string
    description: string
    amount: number
    category: ExpenseCategory
    date: string
    created_at: string
    created_by: string
    notes?: string
}

export interface CreateExpenseDTO {
    description: string
    amount: number
    category: ExpenseCategory
    date: string
    notes?: string
}

export interface UpdateExpenseDTO extends Partial<CreateExpenseDTO> {
    id: string
}
