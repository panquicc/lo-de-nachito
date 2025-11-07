// src/app/components/analytics/filters/quick-filters.tsx
"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface QuickFiltersProps {
  dateRange: DateRange | undefined
  onQuickFilter: (days: number) => void
}

export function QuickFilters({ dateRange, onQuickFilter }: QuickFiltersProps) {
  const quickFilters = [
    { label: "Hoy", days: 0 },
    { label: "7 días", days: 7 },
    { label: "30 días", days: 30 },
    { label: "Este mes", days: -1 },
    { label: "Mes pasado", days: -2 }
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => (
        <Button
          key={filter.label}
          variant="outline"
          size="sm"
          onClick={() => onQuickFilter(filter.days)}
          className="text-xs"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}