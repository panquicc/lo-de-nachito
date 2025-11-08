// src/components/products/ProductForm.tsx
'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Plus, Trash2, Package } from 'lucide-react'
import { Product } from '@/lib/api/products'
import { useProductComponentsManagement } from '@/hooks/useProductComponents'
import { useProducts } from '@/hooks/useProducts'
import { Badge } from '@/components/ui/badge'

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

// Estado para nuevo componente
interface NewComponent {
  component_product_id: string
  quantity_required: number
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading = false }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unlimitedStock, setUnlimitedStock] = useState(product?.stock === null)
  const [isComposite, setIsComposite] = useState(product?.is_composite || false)
  const [newComponent, setNewComponent] = useState<NewComponent>({
    component_product_id: '',
    quantity_required: 1
  })

  // Hooks para gestión de componentes
  const { 
    components, 
    isLoading: componentsLoading, 
    addComponent, 
    deleteComponent,
    isAdding,
    isDeleting
  } = useProductComponentsManagement(product?.id)

  // Hook para obtener productos disponibles como componentes
  const { data: availableProducts } = useProducts()

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

  // Filtrar productos disponibles para componentes (excluir el actual y productos compuestos)
  const availableComponents = availableProducts?.filter(p => 
    p.id !== product?.id && 
    p.is_active && 
    !p.is_composite // No permitir productos compuestos como componentes
  ) || []

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

  const handleAddComponent = async () => {
    if (!newComponent.component_product_id || !newComponent.quantity_required) {
      alert('Selecciona un producto y especifica la cantidad')
      return
    }

    try {
      await addComponent(newComponent)
      setNewComponent({
        component_product_id: '',
        quantity_required: 1
      })
    } catch (error) {
      console.error('Error agregando componente:', error)
    }
  }

  const handleDeleteComponent = async (componentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este componente?')) {
      return
    }

    try {
      await deleteComponent(componentId)
    } catch (error) {
      console.error('Error eliminando componente:', error)
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
                  disabled={isComposite}
                />
                <FormLabel className="!mt-0">
                  Stock ilimitado
                  {isComposite && " (No disponible para productos compuestos)"}
                </FormLabel>
              </div>
              
              {!unlimitedStock && !isComposite && (
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
                : isComposite
                ? 'El stock se calcula automáticamente según los componentes'
                : 'Cantidad disponible en inventario'
              }
            </FormDescription>
          </FormItem>
        </div>

        {/* Gestión de Componentes (solo para productos compuestos) */}
        {product?.id && isComposite && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Componentes del Producto</h3>
            
            <div className="border rounded-lg p-4 space-y-4">
              {/* Lista de componentes existentes */}
              {componentsLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Cargando componentes...</p>
                </div>
              ) : components.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay componentes agregados</p>
                  <p className="text-sm">Agrega los productos que forman parte de este producto compuesto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {components.map((component) => (
                    <div 
                      key={component.id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{component.component.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Stock: {component.component.stock ?? 'Ilimitado'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {component.quantity_required} {component.quantity_required === 1 ? 'unidad' : 'unidades'}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar nuevo componente */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Agregar Componente</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={newComponent.component_product_id}
                    onValueChange={(value) => setNewComponent(prev => ({
                      ...prev,
                      component_product_id: value
                    }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableComponents.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - Stock: {product.stock ?? 'Ilimitado'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="Cantidad"
                    value={newComponent.quantity_required}
                    onChange={(e) => setNewComponent(prev => ({
                      ...prev,
                      quantity_required: parseFloat(e.target.value) || 0
                    }))}
                    className="w-32"
                  />
                  
                  <Button
                    type="button"
                    onClick={handleAddComponent}
                    disabled={isAdding || !newComponent.component_product_id}
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Agregar
                  </Button>
                </div>
                <FormDescription className="mt-2">
                  Ej: Para un "Fernet", agregar "Coca-Cola" con cantidad 1 y "Fernet Branca" con cantidad 0.3
                </FormDescription>
              </div>
            </div>
          </div>
        )}

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
                  {field.value && product?.id && (
                    <FormDescription className="text-blue-600 font-medium">
                      Los componentes se gestionan arriba ↓
                    </FormDescription>
                  )}
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