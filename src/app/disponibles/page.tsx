// src/app/disponibles/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CourtSelection } from '@/components/availability/ourtSelection'
import { DateCalendar } from '@/components/availability/DateCalendar'
import { TimeSlotsModal } from '@/components/availability/TimeSlotsModal'
import { useCourts } from '@/hooks/useCourts'

export default function DisponiblesPage() {
  const [selectedCourt, setSelectedCourt] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showSlotsModal, setShowSlotsModal] = useState(false)

  const { data: courts, isLoading } = useCourts()

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setShowSlotsModal(true)
  }

  const handleCloseModal = () => {
    setShowSlotsModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reserva tu Cancha
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona una cancha y elige tu horario preferido
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <CourtSelection
              courts={courts || []}
              selectedCourt={selectedCourt}
              onCourtSelect={setSelectedCourt}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {selectedCourt && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Selecciona una Fecha
              </h2>
              <DateCalendar
                selectedCourt={selectedCourt}
                onDateSelect={handleDateSelect}
              />
            </CardContent>
          </Card>
        )}

        {selectedCourt && selectedDate && (
          <TimeSlotsModal
            courtId={selectedCourt}
            date={selectedDate}
            isOpen={showSlotsModal}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  )
}