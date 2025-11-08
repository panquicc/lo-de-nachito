// src/components/products/ProductsTable.tsx (actualizado)
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { Trash2, Package, Loader2, Search, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Product } from '@/lib/api/products'
import ProductDialog from './ProductDialog'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: products, isLoading, error, refetch } = useProducts()
  const deleteProductMutation = useDeleteProduct()

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que querés eliminar "${product.name}"?`)) {
      return
    }

    try {
      await deleteProductMutation.mutateAsync(product.id)
    } catch (error) {
      alert('Error al eliminar producto: ' + (error as Error).message)
    }
  }

  const handleSuccess = () => {
    refetch()
  }

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl sm:text-2xl">Inventario de Productos</CardTitle>
          <div className="mt-4">
            <div className="relative max-w-md">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse pl-10"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="flex space-x-1">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
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
          <CardTitle className="text-xl sm:text-2xl">Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error cargando productos: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xl sm:text-2xl">Inventario de Productos</span>
          <Badge variant="outline" className="self-start sm:self-auto">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <div className="mt-4">
          <div className="relative max-w-md">
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
            <p className="text-sm sm:text-base">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                Limpiar búsqueda
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product)
              const isDeleting = deleteProductMutation.isPending && deleteProductMutation.variables === product.id

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Información del producto */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Ícono del producto */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${!product.is_active ? 'bg-gray-400' :
                      product.stock === 0 ? 'bg-red-500' :
                        product.stock && product.stock < 10 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                      <Package className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <span className="font-semibold text-green-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>Stock: {formatStock(product.stock || null)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado y acciones */}
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {/* Badge de estado - siempre visible */}
                    <Badge variant={stockStatus.variant} className="hidden xs:inline-flex">
                      {stockStatus.label}
                    </Badge>

                    {/* Versión desktop - botones separados */}
                    <div className="hidden sm:flex items-center space-x-1">
                      <ProductDialog
                        product={product}
                        variant="edit"
                        onSuccess={handleSuccess}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>

                    {/* Versión móvil - dropdown */}
                    <div className="sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <div className="flex items-center cursor-pointer">
                              <ProductDialog
                                product={product}
                                variant="edit"
                                onSuccess={handleSuccess}
                              />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product)}
                            disabled={isDeleting}
                            className="text-red-600"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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