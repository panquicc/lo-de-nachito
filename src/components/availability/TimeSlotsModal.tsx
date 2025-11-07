// src/components/availability/TimeSlotsModal.tsx
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useAvailability } from '@/hooks/useAvailability'
import { WhatsAppButton } from '@/components/availability/WhatsAppButton'

interface TimeSlotsModalProps {
  courtId: string
  date: Date
  isOpen: boolean
  onClose: () => void
}

export function TimeSlotsModal({ courtId, date, isOpen, onClose }: TimeSlotsModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  
  const { data, isLoading, error } = useAvailability({
    courtId,
    date: date.toISOString().split('T')[0]
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            Horarios Disponibles - {date.toLocaleDateString('es-ES')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Cargando horarios disponibles...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              Error al cargar los horarios disponibles
            </div>
          )}

          {data && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Cancha: <strong>{data.court.name}</strong>
              </p>
              
              {data.availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay horarios disponibles para esta fecha
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {data.availableSlots.map((slot) => (
                    <button
                      key={slot.start_time}
                      onClick={() => setSelectedSlot(
                        selectedSlot === slot.start_time ? null : slot.start_time
                      )}
                      className={`
                        p-4 border-2 rounded-lg text-center transition-all
                        ${selectedSlot === slot.start_time
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                    >
                      {slot.display_time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedSlot && data && (
          <div className="p-6 border-t bg-gray-50">
            <WhatsAppButton
              court={data.court}
              slot={data.availableSlots.find(s => s.start_time === selectedSlot)!}
              date={date}
            />
          </div>
        )}
      </div>
    </div>
  )
}