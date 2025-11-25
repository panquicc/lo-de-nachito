// src/lib/api/products.ts
import { db } from '@/lib/db'
import { addToSyncQueue } from '@/lib/sync'

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

export interface AddComponentData {
  component_product_id: string
  quantity_required: number
}

export interface UpdateComponentData {
  quantity_required: number
}

export async function getProducts(): Promise<Product[]> {
  return db.products.toArray()
}

export async function fetchProductsFromApi(): Promise<Product[]> {
  const response = await fetch('/api/products')
  if (!response.ok) throw new Error('Failed to fetch products from API')
  return response.json()
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }

  await db.products.add(newProduct)
  await addToSyncQueue('products', 'CREATE', newProduct)

  return newProduct
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  await (db.products as any).update(id, updates)
  const updatedProduct = await db.products.get(id)

  if (!updatedProduct) throw new Error('Product not found')

  await addToSyncQueue('products', 'UPDATE', { id, ...updates })

  return updatedProduct
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  await db.products.delete(id)
  await addToSyncQueue('products', 'DELETE', { id })
  return { success: true }
}

// Component functions - currently online only or need specific offline logic
// For now, we can leave them as API calls or implement basic local update if needed.
// Given the complexity of relations, we'll keep them as API calls but they might fail offline.
// A better approach would be to update the local product's components array and queue a specific action.

export async function getProductComponents(productId: string): Promise<ProductComponent[]> {
  const product = await db.products.get(productId)
  if (product && product.components) {
    return product.components
  }
  // Fallback to API if not found locally (shouldn't happen if synced)
  const response = await fetch(`/api/products/${productId}/components`)
  if (!response.ok) throw new Error('Error al obtener componentes del producto')
  return response.json()
}

export async function addProductComponent(
  productId: string,
  componentData: AddComponentData
): Promise<ProductComponent> {
  // This is complex to handle offline without more context on the component product
  // For now, we'll try to execute it against the API.
  // In a full offline implementation, we would update the local product object.

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