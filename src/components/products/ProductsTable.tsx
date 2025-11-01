// src/components/products/ProductsTable.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Package, Loader2, Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { Product } from '@/lib/api/products'
import ProductDialog from './ProductDialog'

// Necesitamos crear el hook useDeleteProduct
export default function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: products, isLoading, error, refetch } = useProducts()
  // Temporalmente usaremos un mock para delete hasta que creemos el hook
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${product.name}"?`)) {
      return
    }

    setDeletingId(product.id)
    try {
      // TODO: Implementar deleteProduct mutation
      // await deleteProductMutation.mutateAsync(product.id)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      refetch()
    } catch (error) {
      alert('Error al eliminar producto: ' + (error as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSuccess = () => {
    refetch()
  }

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="flex space-x-2">
                    <div className="w-9 h-9 bg-gray-200 rounded"></div>
                    <div className="w-9 h-9 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error cargando productos: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  const formatStock = (stock: number | null) => {
    return stock === null ? 'Ilimitado' : stock.toString()
  }

  const getStockStatus = (product: Product) => {
    if (!product.is_active) return { label: 'Inactivo', variant: 'secondary' as const }
    if (product.stock === 0) return { label: 'Sin Stock', variant: 'destructive' as const }
    if (product.stock && product.stock < 10) return { label: 'Stock Bajo', variant: 'destructive' as const }
    return { label: 'Activo', variant: 'default' as const }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Inventario de Productos</span>
          <Badge variant="outline" className="ml-2">
            {filteredProducts.length} productos
          </Badge>
        </CardTitle>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredProducts || filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>
              {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      !product.is_active ? 'bg-gray-400' : 
                      product.stock === 0 ? 'bg-red-500' :
                      product.stock && product.stock < 10 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(product.price)} • Stock: {formatStock(product.stock || null)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                    
                    <div className="flex items-center space-x-2">
                      <ProductDialog 
                        product={product} 
                        variant="edit"
                        onSuccess={handleSuccess}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}