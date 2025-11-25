// src/components/layout/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingCart,
  Package,
  LogOut,
  User,
  ChartPie,
  Receipt,
  TicketCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { usePermissions } from '@/hooks/usePermissions'

interface DashboardSidebarProps {
  user?: SupabaseUser
}

// Navegación base con todos los módulos
const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
  { name: 'Turnos', href: '/dashboard/bookings', icon: Calendar, permission: 'manage_bookings' },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users, permission: 'manage_clients' },
  { name: 'Kiosco', href: '/dashboard/kiosk', icon: ShoppingCart, permission: 'manage_sales' },
  { name: 'Productos', href: '/dashboard/products', icon: Package, permission: 'manage_products' },
  { name: 'Analíticas', href: '/dashboard/analytics', icon: ChartPie, permission: 'view_analytics' },
  { name: 'Gastos', href: '/dashboard/expenses', icon: Receipt, permission: 'manage_expenses' },
  { name: 'Ventas', href: '/dashboard/sales', icon: TicketCheck, permission: 'manage_sales' },
  /* { name: 'Configuración', href: '/dashboard/settings', icon: Settings, permission: 'manage_settings' }, */
]

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { logout, isLoading } = useAuth()
  const { hasPermission } = usePermissions()

  // Filtrar navegación según permisos
  const navigation = allNavigation.filter(item =>
    hasPermission(item.permission as any)
  )

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Lo de Nachito</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        {user && (
          <div className="flex items-center space-x-3 px-2 py-1 text-sm text-gray-300">
            <User className="h-4 w-4" />
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">
                {user.email}
              </p>
              <p className="truncate text-xs text-gray-400">
                <RoleBadge role={user.user_metadata?.role || 'employee'} />
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {isLoading ? 'Cerrando...' : 'Cerrar Sesión'}
        </Button>
      </div>
    </div>
  )
}

// Componente para mostrar el rol del usuario
function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    admin: { label: 'Administrador', color: 'bg-red-500' },
    employee: { label: 'Empleado', color: 'bg-blue-500' },
    partner: { label: 'Socio', color: 'bg-green-500' }
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.employee

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      config.color,
      "text-white"
    )}>
      {config.label}
    </span>
  )
}