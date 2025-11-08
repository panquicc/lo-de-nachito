// src/app/dashboard/products/page.tsx
import ProductsTable from '@/components/products/ProductsTable'
import ProductDialog from '@/components/products/ProductDialog'

export default function ProductsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">Administra el inventario del kiosco</p>
        </div>
        
        <ProductDialog variant="create" />
      </div>

      <ProductsTable />
    </div>
  )
}