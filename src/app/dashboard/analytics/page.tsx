// src/app/dashboard/analytics/page.tsx
"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar } from "@/components/analytics/layout/filter-bar"
import { FinancialOverview } from "@/components/analytics/sections/financial-overview"
import { BookingAnalytics } from "@/components/analytics/sections/booking-analytics"
import { ProductAnalytics } from "@/components/analytics/sections/product-analytics"
import { StockAnalytics } from "@/components/analytics/sections/stock-analytics"
import { DateRange } from "react-day-picker"
import { subDays, format } from "date-fns"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  })

  const handleQuickFilter = (days: number) => {
    const today = new Date()
    
    if (days === -1) {
      // Este mes
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      setDateRange({ from: firstDay, to: today })
    } else if (days === -2) {
      // Mes pasado
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      setDateRange({ from: firstDayLastMonth, to: lastDayLastMonth })
    } else {
      // Días específicos
      const fromDate = new Date(today)
      fromDate.setDate(today.getDate() - days)
      setDateRange({ from: fromDate, to: today })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analíticas</h1>
        <p className="text-muted-foreground">
          Dashboard completo de gestión y balance financiero
        </p>
      </div>

      {/* Filtros */}
      <FilterBar 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onQuickFilter={handleQuickFilter}
      />

      {/* Contenido Principal */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="financial">Financiero</TabsTrigger>
          <TabsTrigger value="bookings">Turnos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          {dateRange && (
            <FinancialOverview 
              dateRange={dateRange}
            />
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <BookingAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="products">
          <ProductAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="stock">
          <StockAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}