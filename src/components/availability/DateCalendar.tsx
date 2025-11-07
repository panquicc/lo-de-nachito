// Reemplaza el componente completo con este:
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface DateCalendarProps {
  selectedCourt: string
  onDateSelect: (date: Date) => void
}

export function DateCalendar({ selectedCourt, onDateSelect }: DateCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    
    // Días del mes anterior para completar la primera semana
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + (direction === 'next' ? 1 : -1), 1))
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header del Calendario - Más compacto en móvil */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 md:h-9 md:w-9"
        >
          <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
        </Button>
        
        <div className="flex items-center gap-2 md:gap-3 text-base md:text-lg font-semibold text-slate-900">
          <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          <span className="capitalize">
            {currentMonth.toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 md:h-9 md:w-9"
        >
          <ChevronRight className="h-3 w-3 md:h-4 md:h-4" />
        </Button>
      </div>

      {/* Grid de Días - Más compacto en móvil */}
      <div className="bg-white rounded-lg p-2 md:p-4 border">
        <div className="grid grid-cols-7 gap-1 mb-1 md:mb-2">
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
            <div key={day} className="text-center text-xs md:text-sm font-medium text-slate-500 py-1 md:py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, isCurrentMonth }) => {
            const isPast = date < today
            const isToday = date.toDateString() === today.toDateString()
            
            return (
              <Button
                key={date.toISOString()}
                variant="ghost"
                onClick={() => !isPast && isCurrentMonth && onDateSelect(date)}
                disabled={isPast || !isCurrentMonth}
                className={cn(
                  "h-8 md:h-12 p-0 text-xs md:text-sm font-normal transition-all duration-200",
                  !isCurrentMonth && "text-slate-300",
                  isPast && "text-slate-300 cursor-not-allowed",
                  isToday && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
                  !isPast && isCurrentMonth && !isToday && 
                    "text-slate-700 hover:bg-blue-100 hover:text-blue-700"
                )}
              >
                {date.getDate()}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Leyenda - Ocultar en móvil para ahorrar espacio */}
      <div className="hidden md:flex items-center justify-center gap-4 md:gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-600 rounded"></div>
          Hoy
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-200 rounded"></div>
          Disponible
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-slate-100 rounded"></div>
          No disponible
        </div>
      </div>
    </div>
  )
}