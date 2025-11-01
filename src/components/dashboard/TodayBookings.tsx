import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Datos mock - luego vendrán de Supabase
const todayBookings = [
  {
    id: 1,
    court: 'Pádel 1',
    time: '10:00 - 11:30',
    client: 'Juan Pérez',
    status: 'PAGADO',
    amount: 12000,
  },
  {
    id: 2,
    court: 'Fútbol 5',
    time: '11:00 - 12:30',
    client: 'Carlos López',
    status: 'SEÑADO',
    amount: 15000,
  },
  {
    id: 3,
    court: 'Pádel 2',
    time: '12:00 - 13:30',
    client: 'María García',
    status: 'PENDIENTE',
    amount: 12000,
  },
]

const statusColors = {
  PAGADO: 'bg-green-100 text-green-800',
  SEÑADO: 'bg-yellow-100 text-yellow-800',
  PENDIENTE: 'bg-red-100 text-red-800',
}

export default function TodayBookings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Turnos de Hoy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todayBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium">{booking.court}</div>
                  <div className="text-sm text-gray-500">{booking.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{booking.client}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className={statusColors[booking.status as keyof typeof statusColors]}>
                    {booking.status}
                  </Badge>
                  <div className="text-sm font-semibold">
                    ${booking.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}