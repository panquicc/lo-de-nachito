// src/app/dashboard/users/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus, Edit, Trash2 } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Unauthorized } from '@/components/auth/Unauthorized'

export default function UsersPage() {
  const { canAccessModule, hasPermission } = usePermissions()

  if (!canAccessModule('users')) {
    return <Unauthorized />
  }

  // Aquí iría la lógica para gestionar usuarios
  // Solo visible para admins

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra los usuarios y permisos del sistema</p>
        </div>
        
        {hasPermission('manage_users') && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Contenido de gestión de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aquí iría la tabla de usuarios...</p>
        </CardContent>
      </Card>
    </div>
  )
}