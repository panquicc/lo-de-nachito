// src/app/dashboard/page.tsx
import LowStockProducts from '@/components/dashboard/LowStockProducts'
import DashboardStats from '@/components/dashboard/DashboardStats'
import TodayBookings from '@/components/dashboard/TodayBookings'
import RecentSales from '@/components/dashboard/RecentSales'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Turnos de Hoy */}
        <div className="lg:col-span-2">
          <TodayBookings />
        </div>

        {/* Ventas Recientes */}
        <div className="lg:col-span-1">
          <RecentSales />
        </div>
      </div>

      {/* Productos con Stock Bajo */}
      <LowStockProducts />
    </div>
  )
}