// src/app/dashboard/page.tsx (actualizado)
import LowStockProducts from '@/components/dashboard/LowStockProducts'
import DashboardStats from '@/components/dashboard/DashboardStats'
import TodayBookings from '@/components/dashboard/TodayBookings'
import RecentSales from '@/components/dashboard/RecentSales'

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de control</h1>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Turnos de Hoy */}
        <div className="xl:col-span-2">
          <TodayBookings />
        </div>

        {/* Ventas Recientes */}
        <div className="xl:col-span-1">
          <RecentSales />
        </div>
      </div>

      {/* Productos con Stock Bajo */}
      <LowStockProducts />
    </div>
  )
}