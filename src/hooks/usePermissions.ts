// src/hooks/usePermissions.ts
'use client'

import { useUserRole, UserRole } from './useUserRole'

export type Permission =
  | 'view_dashboard'
  | 'manage_bookings'
  | 'manage_clients'
  | 'manage_products'
  | 'manage_sales'
  | 'manage_users'
  | 'view_analytics'
  | 'manage_settings'
  | 'manage_expenses'
  | 'manage_sales'

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_bookings',
    'manage_clients',
    'manage_products',
    'manage_sales',
    'manage_users',
    'view_analytics',
    'manage_settings',
    'manage_expenses',
    'manage_sales'
  ],
  partner: [
    'view_dashboard',
    'view_analytics',
    'manage_sales'
  ],
  employee: [
    'view_dashboard',
    'manage_bookings',
    'manage_clients',
    'manage_products',
    'manage_sales',
    'manage_expenses',
    'manage_sales'
  ]
}

export function usePermissions() {
  const { data: user, isLoading } = useUserRole()

  const hasPermission = (permission: Permission) => {
    if (!user || !user.role) return false
    return rolePermissions[user.role as UserRole]?.includes(permission) ?? false
  }

  const canAccessModule = (moduleName: string) => {
    switch (moduleName) {
      case 'users': return hasPermission('manage_users')
      case 'expenses': return hasPermission('manage_expenses')
      case 'products': return hasPermission('manage_products')
      case 'sales': return hasPermission('manage_sales')
      case 'bookings': return hasPermission('manage_bookings')
      case 'analytics': return hasPermission('view_analytics')
      case 'settings': return hasPermission('manage_settings')
      case 'clients': return hasPermission('manage_clients')
      case 'kiosk': return hasPermission('manage_sales')
      default: return true
    }
  }

  return {
    user,
    isLoading,
    hasPermission,
    canAccessModule,
    role: user?.role
  }
}