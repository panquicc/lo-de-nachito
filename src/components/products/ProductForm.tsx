// src/components/products/ProductForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { Product } from '@/lib/api/products'

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  stock: z.union([z.number().min(0, 'El stock no puede ser negativo'), z.null()]),
  is_active: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product
  onSubmit: (data: Omit<Product, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unlimitedStock, setUnlimitedStock] = useState(product?.stock === null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        stock: unlimitedStock ? null : data.stock,
      }
      await onSubmit(submitData as Omit<Product, 'id' | 'created_at'>)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnlimitedStockChange = (checked: boolean) => {
    setUnlimitedStock(checked)
    if (checked) {
      form.setValue('stock', 0)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Coca-Cola 500ml" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Precio */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock */}
          <FormItem>
            <FormLabel>Stock</FormLabel>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={unlimitedStock}
                  onCheckedChange={handleUnlimitedStockChange}
                />
                <FormLabel className="!mt-0">Stock ilimitado</FormLabel>
              </div>
              
              {!unlimitedStock && (
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormDescription>
              {unlimitedStock 
                ? 'El producto siempre estará disponible' 
                : 'Cantidad disponible en inventario'
              }
            </FormDescription>
          </FormItem>
        </div>

        {/* Estado Activo */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Producto Activo</FormLabel>
                <FormDescription>
                  {field.value 
                    ? 'El producto está disponible para la venta' 
                    : 'El producto no aparecerá en el kiosco'
                  }
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Botones */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {product ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              product ? 'Actualizar Producto' : 'Crear Producto'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}