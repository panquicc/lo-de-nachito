// src/components/analytics/cards/metric-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: number
  format: 'currency' | 'number' | 'percentage'
  description: string
  trend?: number
  icon?: React.ReactNode
}

export function MetricCard({ title, value, format, description, trend, icon }: MetricCardProps) {
  const formattedValue = formatValue(value, format)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend !== undefined && (
            <span className={`text-xs ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatValue(value: number, format: MetricCardProps['format']): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(value)
    case 'percentage':
      return `${value}%`
    case 'number':
    default:
      return value.toLocaleString('es-AR')
  }
}