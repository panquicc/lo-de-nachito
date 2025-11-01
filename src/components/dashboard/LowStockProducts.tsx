import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

// Mock data
const lowStockProducts = [
  {
    id: '1',
    name: 'Cerveza Heineken',
    currentStock: 2,
    minStock: 5,
    price: 1800
  },
  {
    id: '2',
    name: 'Barrita de Cereal',
    currentStock: 3,
    minStock: 10,
    price: 400
  },
  {
    id: '3',
    name: 'Coca-Cola 500ml',
    currentStock: 8,
    minStock: 15,
    price: 1200
  }
]

export default function LowStockProducts() {
  const getStockLevel = (current: number, min: number) => {
    const percentage = (current / min) * 100
    if (percentage <= 20) return 'critical'
    if (percentage <= 50) return 'low'
    return 'warning'
  }

  const stockLevelColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
          Productos con Stock Bajo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Todos los productos tienen stock suficiente
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => {
              const stockLevel = getStockLevel(product.currentStock, product.minStock)
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      Stock actual: {product.currentStock} • Mínimo: {product.minStock}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className={stockLevelColors[stockLevel]}>
                      {stockLevel === 'critical' ? 'Crítico' : 
                       stockLevel === 'low' ? 'Bajo' : 'Atención'}
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold">${product.price}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {lowStockProducts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Es recomendable reponer el stock de estos productos
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}