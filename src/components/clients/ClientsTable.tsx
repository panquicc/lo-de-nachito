// src/components/clients/ClientsTable.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Phone, Mail, Search, Loader2, User } from 'lucide-react'
import { useClients, useDeleteClient } from '@/hooks/useClients'
import { Client } from '@/lib/api/clients'
import ClientDialog from './ClientDialog'

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
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-9 h-9 bg-gray-200 rounded"></div>
                    <div className="w-9 h-9 bg-gray-200 rounded"></div>
                  </div>
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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Lista de Clientes</span>
          {clients && (
            <Badge variant="secondary">
              {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <div className="mt-4">
          <div className="relative">
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
            <p>
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-3">
                      {client.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Registrado: {formatDate(client.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">ID</div>
                    <div className="font-mono text-xs text-gray-400">
                      {client.id.slice(0, 8)}...
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
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
                    >
                      {deleteClientMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
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