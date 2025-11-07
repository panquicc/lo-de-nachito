// src/components/analytics/sections/booking-analytics.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRange } from "react-day-picker"

interface BookingAnalyticsProps {
  dateRange?: DateRange
}

export function BookingAnalytics({ dateRange }: BookingAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Turnos</CardTitle>
        <CardDescription>
          Estadísticas detalladas de reservas y ocupación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Componente de análisis de turnos - En desarrollo</p>
          <p className="text-sm mt-2">
            Aquí irá el análisis por cancha, hora pico, métodos de pago, etc.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}