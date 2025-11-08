// src/components/layout/MobileSidebar.tsx
'use client'

import { User as SupabaseUser } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingCart,
  Package,
  LogOut,
  User,
  ChartPie,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Turnos', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users },
  { name: 'Kiosco', href: '/dashboard/kiosk', icon: ShoppingCart },
  { name: 'Productos', href: '/dashboard/products', icon: Package },
  { name: 'Analíticas', href: '/dashboard/analytics', icon: ChartPie },
]

interface MobileSidebarProps {
  user?: SupabaseUser
}

export default function MobileSidebar({ user }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Botón hamburguesa */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden bg-white shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar móvil */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">Lo de Nachito</h1>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
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
                  onClick={() => setIsOpen(false)}
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
      </div>
    </>
  )
}