// src/components/analytics/layout/filter-bar.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DateRange } from "react-day-picker"
import { DateRangeFilter } from "../filters/date-range-filter"
import { QuickFilters } from "../filters/quick-filters"
import { format } from "date-fns"

interface FilterBarProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  onQuickFilter: (days: number) => void
}

export function FilterBar({ dateRange, onDateRangeChange, onQuickFilter }: FilterBarProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <QuickFilters dateRange={dateRange} onQuickFilter={onQuickFilter} />
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
        </div>

        {dateRange?.from && dateRange.to && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando datos del período:{" "}
            <span className="font-medium">
              {format(dateRange.from, "dd/MM/yyyy")} al {format(dateRange.to, "dd/MM/yyyy")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}