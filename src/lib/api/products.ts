// src/lib/api/products.ts
export interface ProductComponent {
  id: string
  quantity_required: number
  component: Product
}

export interface Product {
  id: string
  name: string
  price: number
  cost_price: number | null
  stock: number | null
  is_active: boolean
  rotation_rate: 'high' | 'medium' | 'low'
  min_stock: number
  is_composite: boolean
  track_stock: boolean
  created_at: string
  components?: ProductComponent[]
}

export interface ProductComponent {
  id: string
  quantity_required: number
  component: Product
}

export interface AddComponentData {
  component_product_id: string
  quantity_required: number
}

export interface UpdateComponentData {
  quantity_required: number
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Fallo al obtener el producto')
  }

  return response.json()
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Fallo al crear el producto')
  }

  return response.json()
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Fallo al actualizar el producto')
  }

  return response.json()
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete product')
  }

  return response.json()
}

// Agregar estas funciones al archivo existente
export async function getProductComponents(productId: string): Promise<ProductComponent[]> {
  const response = await fetch(`/api/products/${productId}/components`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al obtener componentes del producto')
  }

  return response.json()
}

export async function addProductComponent(
  productId: string, 
  componentData: AddComponentData
): Promise<ProductComponent> {
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
}

export async function updateProductComponent(
  productId: string,
  componentId: string,
  updateData: UpdateComponentData
): Promise<ProductComponent> {
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
}

export async function deleteProductComponent(
  productId: string,
  componentId: string
): Promise<{ success: boolean; message: string }> {
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
}