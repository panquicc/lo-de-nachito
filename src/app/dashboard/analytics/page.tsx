// src/app/dashboard/analytics/page.tsx
"use client"

import { FinancialOverview } from "@/components/analytics/sections/financial-overview"
import { BookingAnalytics } from "@/components/analytics/sections/booking-analytics"
import { ProductAnalytics } from "@/components/analytics/sections/product-analytics"
import { StockAnalytics } from "@/components/analytics/sections/stock-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar } from "@/components/analytics/layout/filter-bar"
import { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { useState } from 'react'

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
    <div className="space-y-6 m-4">
      {/* Header - Solo mejoras sutiles */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analíticas</h1>
        <p className="text-muted-foreground text-base">
          Dashboard completo de gestión y balance financiero
        </p>
      </div>

      {/* Filtros - Mismo diseño pero mejor espaciado */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <FilterBar 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onQuickFilter={handleQuickFilter}
        />
      </div>

      {/* Contenido Principal - Tabs mejorados */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-lg w-full grid grid-cols-4">
          <TabsTrigger 
            value="financial" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Financiero
          </TabsTrigger>
          <TabsTrigger 
            value="bookings" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Turnos
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Productos
          </TabsTrigger>
          <TabsTrigger 
            value="stock" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          {dateRange && (
            <FinancialOverview 
              dateRange={dateRange}
            />
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <BookingAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <StockAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}