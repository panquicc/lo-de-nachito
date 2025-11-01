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
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { User as SupabaseUser } from '@supabase/supabase-js'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Turnos', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Kiosco', href: '/dashboard/kiosk', icon: ShoppingCart },
  { name: 'Productos', href: '/dashboard/products', icon: Package },
]

interface DashboardSidebarProps {
  user?: SupabaseUser
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { logout, isLoading } = useAuth()

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
                Administrador
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