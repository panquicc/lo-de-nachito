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