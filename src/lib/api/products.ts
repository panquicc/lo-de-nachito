// src/lib/api/products.ts
export type Product = {
  id: string
  name: string
  price: number
  stock?: number
  is_active: boolean
  created_at: string
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch products')
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
    throw new Error(error.error || 'Failed to create product')
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
    throw new Error(error.error || 'Failed to update product')
  }

  return response.json()
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete product')
  }
}