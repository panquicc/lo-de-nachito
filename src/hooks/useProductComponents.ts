// src/hooks/useProductComponents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ProductComponent {
  id: string
  quantity_required: number
  component: {
    id: string
    name: string
    price: number
    cost_price: number | null
    stock: number | null
    track_stock: boolean
    is_active: boolean
  }
}

export interface AddComponentData {
  component_product_id: string
  quantity_required: number
}

export interface UpdateComponentData {
  quantity_required: number
}

// GET - Obtener componentes de un producto
export function useProductComponents(productId: string | undefined) {
  return useQuery({
    queryKey: ['product-components', productId],
    queryFn: async (): Promise<ProductComponent[]> => {
      if (!productId) {
        return []
      }
      
      const response = await fetch(`/api/products/${productId}/components`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener componentes del producto')
      }

      return response.json()
    },
    enabled: !!productId, // Solo ejecutar si hay productId
  })
}

// POST - Agregar componente a un producto
export function useAddProductComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      productId, 
      componentData 
    }: { 
      productId: string
      componentData: AddComponentData 
    }): Promise<ProductComponent> => {
      const response = await fetch(`/api/products/${productId}/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(componentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al agregar componente')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidar y actualizar queries relacionados
      queryClient.invalidateQueries({ 
        queryKey: ['product-components', variables.productId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['products', variables.productId] 
      })
    },
  })
}

// PUT - Actualizar componente
export function useUpdateProductComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      componentId,
      updateData
    }: {
      productId: string
      componentId: string
      updateData: UpdateComponentData
    }): Promise<ProductComponent> => {
      const response = await fetch(
        `/api/products/${productId}/components/${componentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar componente')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionados
      queryClient.invalidateQueries({ 
        queryKey: ['product-components', variables.productId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['products', variables.productId] 
      })
    },
  })
}

// DELETE - Eliminar componente
export function useDeleteProductComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      componentId
    }: {
      productId: string
      componentId: string
    }): Promise<{ success: boolean; message: string }> => {
      const response = await fetch(
        `/api/products/${productId}/components/${componentId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar componente')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Invalidar queries relacionados
      queryClient.invalidateQueries({ 
        queryKey: ['product-components', variables.productId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['products'] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['products', variables.productId] 
      })
    },
  })
}

// Hook combinado para fácil uso
export function useProductComponentsManagement(productId: string | undefined) {
  const { data: components, isLoading, error } = useProductComponents(productId)
  const addComponent = useAddProductComponent()
  const updateComponent = useUpdateProductComponent()
  const deleteComponent = useDeleteProductComponent()

  return {
    components: components || [],
    isLoading,
    error,
    
    // Mutaciones
    addComponent: (componentData: AddComponentData) => 
      productId ? addComponent.mutateAsync({ productId, componentData }) : Promise.reject('No product ID'),
    
    updateComponent: (componentId: string, updateData: UpdateComponentData) =>
      productId ? updateComponent.mutateAsync({ productId, componentId, updateData }) : Promise.reject('No product ID'),
    
    deleteComponent: (componentId: string) =>
      productId ? deleteComponent.mutateAsync({ productId, componentId }) : Promise.reject('No product ID'),

    // Estados de carga de mutaciones
    isAdding: addComponent.isPending,
    isUpdating: updateComponent.isPending,
    isDeleting: deleteComponent.isPending,
  }
}