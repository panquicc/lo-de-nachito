// src/app/dashboard/expenses/page.tsx
import ExpensesTable from '@/components/expenses/ExpensesTable'
import ExpenseDialog from '@/components/expenses/ExpenseDialog'

export default function ExpensesPage() {
    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header responsivo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                        Gestión de Gastos
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Registra y administra los gastos del predio
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <ExpenseDialog variant="create" />
                </div>
            </div>

            <ExpensesTable />
        </div>
    )
}
