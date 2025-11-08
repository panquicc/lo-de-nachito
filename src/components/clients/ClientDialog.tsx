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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Plus, Edit } from 'lucide-react'
import { useState } from 'react'
import ClientForm from './ClientForm'
import { Client } from '@/lib/api/clients'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'
import { useMobile } from '@/hooks/useMobile'

interface ClientDialogProps {
  client?: Client
  variant?: 'create' | 'edit'
  onSuccess?: () => void
}

export default function ClientDialog({ client, variant = 'create', onSuccess }: ClientDialogProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()
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
      console.error('Error submitting client:', error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending

  // Contenido del formulario
  const formContent = (
    <ClientForm
      client={client}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  )

  // Trigger button
  const triggerButton = variant === 'create' ? (
    <Button className="w-full sm:w-auto">
      <Plus className="h-4 w-4 mr-2" />
      Nuevo Cliente
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="h-9 w-9 sm:h-9 sm:w-auto p-0 sm:px-3 sm:py-2">
      <Edit className="h-4 w-4" />
      <span className="hidden sm:inline ml-2">Editar</span>
    </Button>
  )

  // Usar Drawer en móvil y Dialog en desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {triggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {variant === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
            </DrawerTitle>
            <DrawerDescription>
              {variant === 'create' 
                ? 'Completá los datos del nuevo cliente.' 
                : 'Modificá los datos del cliente.'
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
        {formContent}
      </DialogContent>
    </Dialog>
  )
}