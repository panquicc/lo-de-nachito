// src/components/dashboard/DashboardStats.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, DollarSign, Package, ShoppingCart } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboard'

const statsConfig = [
  {
    title: 'Turnos Hoy',
    key: 'todayBookings' as const,
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    formatter: (value: number) => value.toString()
  },
  {
    title: 'Clientes Activos',
    key: 'activeClients' as const,
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    formatter: (value: number) => value.toString()
  },
  {
    title: 'Ventas Hoy',
    key: 'todayRevenue' as const,
    icon: DollarSign,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    formatter: (value: number) => `$${value.toLocaleString()}`
  },
  {
    title: 'Productos Kiosco',
    key: 'totalProducts' as const,
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    formatter: (value: number) => value.toString()
  },
  {
    title: 'Stock Bajo',
    key: 'lowStockCount' as const,
    icon: ShoppingCart,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    formatter: (value: number) => value.toString()
  }
]

export default function DashboardStats() {
  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsConfig.map((stat) => (
          <Card key={stat.title} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        Error cargando estadísticas: {error.message}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {stat.formatter(stats?.[stat.key] || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.key === 'lowStockCount' && stats && stats[stat.key] > 0 
                ? 'Necesitan reposición' 
                : 'Actualizado ahora'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}