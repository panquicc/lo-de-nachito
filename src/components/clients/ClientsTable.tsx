// src/components/clients/ClientsTable.tsx (actualizado)
'use client'

import { Trash2, Phone, Mail, Search, Loader2, User, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClients, useDeleteClient } from '@/hooks/useClients'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Client } from '@/lib/api/clients'
import ClientDialog from './ClientDialog'
import { useState } from 'react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ClientsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: clients, isLoading, error, refetch } = useClients(searchTerm || undefined)
  const deleteClientMutation = useDeleteClient()

  const handleDelete = async (client: Client) => {
    if (!confirm(`¿Estás seguro de que querés eliminar a ${client.name}?`)) {
      return
    }

    try {
      await deleteClientMutation.mutateAsync(client.id)
    } catch (error) {
      alert('Error al eliminar cliente: ' + (error as Error).message)
    }
  }

  const handleSuccess = () => {
    refetch()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse pl-10"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error cargando clientes: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xl sm:text-2xl">Lista de Clientes</span>
          {clients && (
            <Badge variant="secondary" className="self-start sm:self-auto">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <div className="mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!clients || clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm sm:text-base">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Información del cliente */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {getInitials(client.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">
                      {client.name}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1 mt-1">
                      {/* Teléfono */}
                      {client.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <Link
                            href={`https://wa.me/${client.phone}`}
                            target='_blank'
                            className="truncate hover:text-blue-600"
                          >
                            {client.phone}
                          </Link>
                        </div>
                      )}

                      {/* Email */}
                      {client.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}

                      {/* Fecha de registro */}
                      <div className="text-gray-400">
                        Registrado: {formatDate(client.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  {/* Versión desktop - botones separados */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <ClientDialog
                      client={client}
                      variant="edit"
                      onSuccess={handleSuccess}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(client)}
                      disabled={deleteClientMutation.isPending}
                      className="h-9 w-9 p-0"
                    >
                      {deleteClientMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Versión móvil - dropdown */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <ClientDialog
                            client={client}
                            variant="edit"
                            onSuccess={handleSuccess}
                          />
                        </DropdownMenuItem>
                        Editar
                        <DropdownMenuItem
                          onClick={() => handleDelete(client)}
                          disabled={deleteClientMutation.isPending}
                          className="text-red-600"
                        >
                          {deleteClientMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}