// src/app/dashboard/clients/page.tsx
import ClientsTable from '@/components/clients/ClientsTable'
import ClientDialog from '@/components/clients/ClientDialog'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-2">Administra la información de los clientes</p>
        </div>
        
        <ClientDialog variant="create" />
      </div>

      <ClientsTable />
    </div>
  )
}