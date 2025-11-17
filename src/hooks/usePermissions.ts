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

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_bookings',
    'manage_clients',
    'manage_products',
    'manage_sales',
    'manage_users',
    'view_analytics',
    'manage_settings'
  ],
  employee: [
    'view_dashboard',
    'manage_bookings',
    'manage_clients',
    'manage_products',
    'manage_sales'
  ],
  partner: [
    'view_dashboard',
    'view_analytics'
  ]
}

export function usePermissions() {
  const { data: user, isLoading } = useUserRole()

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.is_active) return false
    // Type assertion - asumimos que user.role es válido
    const userRole = user.role as UserRole
    return rolePermissions[userRole]?.includes(permission) || false
  }

  const canAccessModule = (module: string): boolean => {
    const modulePermissions: Record<string, Permission> = {
      dashboard: 'view_dashboard',
      bookings: 'manage_bookings',
      clients: 'manage_clients',
      products: 'manage_products',
      kiosk: 'manage_sales',
      analytics: 'view_analytics',
      users: 'manage_users',
      settings: 'manage_settings'
    }

    const requiredPermission = modulePermissions[module]
    return requiredPermission ? hasPermission(requiredPermission) : false
  }

  return {
    user,
    isLoading,
    hasPermission,
    canAccessModule,
    role: user?.role
  }
}