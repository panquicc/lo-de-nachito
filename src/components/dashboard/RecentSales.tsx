import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock data
const recentSales = [
  {
    id: '1',
    client: 'Juan Pérez',
    amount: 2400,
    items: 3,
    time: '10:30 AM',
    paymentMethod: 'EFECTIVO'
  },
  {
    id: '2',
    client: 'María García',
    amount: 1800,
    items: 2,
    time: '11:15 AM',
    paymentMethod: 'TARJETA'
  },
  {
    id: '3',
    client: 'Carlos López',
    amount: 3600,
    items: 4,
    time: '12:45 PM',
    paymentMethod: 'EFECTIVO'
  },
  {
    id: '4',
    client: 'Cliente Ocasional',
    amount: 1200,
    items: 1,
    time: '14:20 PM',
    paymentMethod: 'EFECTIVO'
  }
]

const paymentMethodColors = {
  EFECTIVO: 'bg-green-100 text-green-800',
  TARJETA: 'bg-blue-100 text-blue-800',
  TRANSFERENCIA: 'bg-purple-100 text-purple-800'
}

export default function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{sale.client}</div>
                <div className="text-xs text-gray-500">
                  {sale.items} producto{sale.items > 1 ? 's' : ''} • {sale.time}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-sm">${sale.amount}</div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${paymentMethodColors[sale.paymentMethod as keyof typeof paymentMethodColors]}`}
                >
                  {sale.paymentMethod}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total del día:</span>
            <span className="font-bold text-lg">$9.000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}