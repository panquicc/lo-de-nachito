// src/components/clients/ClientDialog.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit } from 'lucide-react'
import { useState } from 'react'
import ClientForm from './ClientForm'
import { Client } from '@/lib/api/clients'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'

interface ClientDialogProps {
  client?: Client
  variant?: 'create' | 'edit'
  onSuccess?: () => void
}

export default function ClientDialog({ client, variant = 'create', onSuccess }: ClientDialogProps) {
  const [open, setOpen] = useState(false)
  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()

  const handleSubmit = async (data: any) => {
    try {
      if (variant === 'create') {
        await createClientMutation.mutateAsync(data)
      } else if (client) {
        await updateClientMutation.mutateAsync({ id: client.id, updates: data })
      }
      
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      // El error se maneja en el mutation
      console.error('Error submitting client:', error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'create' ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {variant === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {variant === 'create' 
              ? 'Completá los datos del nuevo cliente.' 
              : 'Modificá los datos del cliente.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <ClientForm
          client={client}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}