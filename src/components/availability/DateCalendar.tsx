// src/components/availability/DateCalendar.tsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="text-xl font-semibold">
          {currentMonth.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const isPast = day < today
          const isToday = day.toDateString() === today.toDateString()
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && onDateSelect(day)}
              disabled={isPast}
              className={`
                p-3 rounded-lg text-center transition-all
                ${isPast 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : isToday
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-700'
                }
              `}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}