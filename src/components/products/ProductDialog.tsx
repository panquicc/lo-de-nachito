// src/components/products/ProductDialog.tsx
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
import ProductForm from './ProductForm'
import { Product } from '@/lib/api/products'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'

interface ProductDialogProps {
  product?: Product
  variant?: 'create' | 'edit'
  onSuccess?: () => void
}

export default function ProductDialog({ product, variant = 'create', onSuccess }: ProductDialogProps) {
  const [open, setOpen] = useState(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'create' ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
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
          <ProductForm
            product={product}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}