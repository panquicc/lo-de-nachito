// src/app/dashboard/products/page.tsx
import ProductsTable from '@/components/products/ProductsTable'
import ProductDialog from '@/components/products/ProductDialog'

export default function ProductsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Administra el inventario del kiosco
          </p>
        </div>

        <div className="flex-shrink-0">
          <ProductDialog variant="create" />
        </div>
      </div>

      <ProductsTable />
    </div>
  )
}