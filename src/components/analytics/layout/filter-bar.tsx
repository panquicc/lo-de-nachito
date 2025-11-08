// src/components/analytics/layout/filter-bar.tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { Calendar } from "lucide-react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  onQuickFilter: (days: number) => void
}

export function FilterBar({ dateRange, onDateRangeChange, onQuickFilter }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy", { locale: es })
                )
              ) : (
                <span>Selecciona un rango</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter(7)}
          className={cn(
            dateRange?.from?.getTime() === new Date().setDate(new Date().getDate() - 7) && 
            "bg-gray-100 border-gray-300"
          )}
        >
          7 días
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter(30)}
          className={cn(
            dateRange?.from?.getTime() === new Date().setDate(new Date().getDate() - 30) && 
            "bg-gray-100 border-gray-300"
          )}
        >
          30 días
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter(-1)}
          className={cn(
            dateRange?.from?.getDate() === 1 && 
            dateRange?.from?.getMonth() === new Date().getMonth() &&
            "bg-gray-100 border-gray-300"
          )}
        >
          Este mes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter(-2)}
        >
          Mes pasado
        </Button>
      </div>
    </div>
  )
}