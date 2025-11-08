// src/components/products/ProductDialog.tsx (actualizado)
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
import ProductForm from './ProductForm'
import { Product } from '@/lib/api/products'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useMobile } from '@/hooks/useMobile'

interface ProductDialogProps {
  product?: Product
  variant?: 'create' | 'edit'
  onSuccess?: () => void
}

export default function ProductDialog({ product, variant = 'create', onSuccess }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useMobile()
  const createProductMutation = useCreateProduct()
  const updateProductMutation = useUpdateProduct()

  const handleSubmit = async (data: Omit<Product, 'id' | 'created_at'>) => {
    try {
      if (variant === 'create') {
        await createProductMutation.mutateAsync(data)
      } else if (product) {
        await updateProductMutation.mutateAsync({ id: product.id, updates: data })
      }

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting product:', error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending

  // Contenido del formulario
  const formContent = (
    <ProductForm
      product={product}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  )

  // Trigger button
  const triggerButton = variant === 'create' ? (
    <Button className="w-full sm:w-auto">
      <Plus className="h-4 w-4 mr-2" />
      Nuevo Producto
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
          <DrawerHeader className="text-left pb-4">
            <DrawerTitle className="text-xl">
              {variant === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
            </DrawerTitle>
            <DrawerDescription>
              {variant === 'create'
                ? 'Completá toda la información del nuevo producto'
                : 'Modificá los datos del producto según sea necesario'
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1">
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {variant === 'create' ? 'Crear Nuevo Producto' : 'Editar Producto'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {variant === 'create'
              ? 'Completá toda la información del nuevo producto'
              : 'Modificá los datos del producto según sea necesario'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  )
}