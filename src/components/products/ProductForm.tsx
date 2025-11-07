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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { Product } from '@/lib/api/products'

// Schema actualizado con nuevos campos
const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  cost_price: z.number().min(0, 'El costo no puede ser negativo').optional().nullable(),
  stock: z.union([z.number().min(0, 'El stock no puede ser negativo'), z.null()]),
  is_active: z.boolean().default(true),
  rotation_rate: z.enum(['high', 'medium', 'low']).default('medium'),
  min_stock: z.number().min(0, 'El stock mínimo no puede ser negativo').default(0),
  is_composite: z.boolean().default(false),
  track_stock: z.boolean().default(true),
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
  const [isComposite, setIsComposite] = useState(product?.is_composite || false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      cost_price: product?.cost_price || null,
      stock: product?.stock ?? 0,
      is_active: product?.is_active ?? true,
      rotation_rate: product?.rotation_rate || 'medium',
      min_stock: product?.min_stock || 0,
      is_composite: product?.is_composite || false,
      track_stock: product?.track_stock ?? true,
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        stock: unlimitedStock ? null : data.stock,
        // Si es producto compuesto, no lleva control de stock tradicional
        track_stock: isComposite ? false : data.track_stock,
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

  const handleCompositeChange = (checked: boolean) => {
    setIsComposite(checked)
    form.setValue('is_composite', checked)
    // Si es compuesto, desactivamos track_stock
    if (checked) {
      form.setValue('track_stock', false)
    }
  }

  const rotationRateLabels = {
    high: 'Alta rotación',
    medium: 'Rotación media', 
    low: 'Baja rotación'
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información Básica</h3>
          
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
            {/* Precio de Venta */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta *</FormLabel>
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

            {/* Precio de Costo */}
            <FormField
              control={form.control}
              name="cost_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Costo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Costo de compra del producto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Gestión de Stock */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Gestión de Stock</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rotación */}
            <FormField
              control={form.control}
              name="rotation_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rotación del Producto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rotación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">Alta rotación</SelectItem>
                      <SelectItem value="medium">Rotación media</SelectItem>
                      <SelectItem value="low">Baja rotación</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Frecuencia de venta y reposición
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock Mínimo */}
            <FormField
              control={form.control}
              name="min_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Mínimo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Alerta cuando el stock sea menor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Stock Actual */}
          <FormItem>
            <FormLabel>Stock Actual</FormLabel>
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

        {/* Configuraciones Avanzadas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuraciones Avanzadas</h3>

          {/* Producto Compuesto */}
          <FormField
            control={form.control}
            name="is_composite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Producto Compuesto</FormLabel>
                  <FormDescription>
                    {field.value 
                      ? 'Este producto se arma con otros productos del inventario (ej: Fernet)' 
                      : 'Producto individual que se vende directamente'
                    }
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={handleCompositeChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Control de Stock (solo para productos no compuestos) */}
          {!isComposite && (
            <FormField
              control={form.control}
              name="track_stock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Controlar Stock</FormLabel>
                    <FormDescription>
                      {field.value 
                        ? 'Se lleva control del inventario de este producto' 
                        : 'No se controla el stock de este producto'
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
          )}

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
        </div>

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