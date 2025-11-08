// src/app/disponibles/page.tsx 
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CourtSelection } from '@/components/availability/CourtSelection'
import { TimeSlotsModal } from '@/components/availability/TimeSlotsModal'
import { DateCalendar } from '@/components/availability/DateCalendar'
import { useCourts } from '@/hooks/useCourts'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import { useState, useRef } from 'react' // ← Agregar useRef

export default function DisponiblesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [selectedCourt, setSelectedCourt] = useState<string>('')
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const step2Ref = useRef<HTMLDivElement>(null) // ← Agregar referencia

  const { data: courts, isLoading } = useCourts()

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowSlotsModal(true)
  }

  const handleCloseModal = () => {
    setShowSlotsModal(false)
    setSelectedSlots([])
  }

  // ← Nueva función para manejar selección de cancha
  const handleCourtSelect = (courtId: string) => {
    setSelectedCourt(courtId)
    
    // Hacer scroll al paso 2 después de un pequeño delay
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4 max-w-4xl">
        {/* Header Mejorado - Más compacto en móvil */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 md:px-6 md:py-3 shadow-sm border mb-4 md:mb-6">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            <Badge variant="secondary" className="text-xs md:text-sm">
              Disponibilidad en Lo de Nachito
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 md:mb-4">
            Reserva tu Cancha
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Encuentra y reserva tu horario perfecto en simples pasos
          </p>
        </div>

        {/* Proceso de Reserva */}
        <div className="space-y-6">
          {/* Paso 1: Selección de Cancha */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm">
                  1
                </div>
                Selecciona tu Cancha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CourtSelection
                courts={courts || []}
                selectedCourt={selectedCourt}
                onCourtSelect={handleCourtSelect} // ← Usar nueva función
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Paso 2: Selección de Fecha */}
          {selectedCourt && (
            <Card 
              ref={step2Ref} // ← Agregar referencia aquí
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm">
                    2
                  </div>
                  Elige la Fecha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DateCalendar
                  selectedCourt={selectedCourt}
                  onDateSelect={handleDateSelect}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de Horarios */}
        {selectedCourt && selectedDate && (
          <TimeSlotsModal
            courtId={selectedCourt}
            date={selectedDate}
            isOpen={showSlotsModal}
            onClose={handleCloseModal}
            selectedSlots={selectedSlots}
            onSlotSelect={setSelectedSlots}
          />
        )}
      </div>
    </div>
  )
}