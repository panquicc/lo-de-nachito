// src/components/availability/TimeSlotsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WhatsAppButton } from '@/components/availability/WhatsAppButton'
import { useAvailability } from '@/hooks/useAvailability'
import { Clock, Check, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TimeSlotsModalProps {
  courtId: string
  date: Date
  isOpen: boolean
  onClose: () => void
  selectedSlots: string[]
  onSlotSelect: (slots: string[]) => void
}

export function TimeSlotsModal({
  courtId,
  date,
  isOpen,
  onClose,
  selectedSlots,
  onSlotSelect
}: TimeSlotsModalProps) {
  const { data, isLoading, error } = useAvailability({
    courtId,
    date: date.toISOString().split('T')[0]
  })

  const handleClose = () => {
    onSlotSelect([])
    onClose()
  }

  const handleSlotToggle = (slotId: string) => {
    if (selectedSlots.includes(slotId)) {
      // Remover slot si ya está seleccionado
      onSlotSelect(selectedSlots.filter(s => s !== slotId))
    } else {
      // Agregar slot si no ha alcanzado el límite
      if (selectedSlots.length < 3) {
        onSlotSelect([...selectedSlots, slotId])
      }
    }
  }

  const getSelectedSlotsData = () => {
    return selectedSlots.map(slotId =>
      data?.availableSlots.find(slot => slot.start_time === slotId)
    ).filter(Boolean) as Array<{
      start_time: string
      end_time: string
      display_time: string
    }>
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-98 p-0 gap-0 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 md:p-6 pb-3 md:pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              Horarios Disponibles
            </DialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-600">
            <Badge variant="secondary" className="font-normal text-xs">
              {date.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </Badge>
            {data && (
              <span className="text-xs md:text-sm">• {data.court.name}</span>
            )}
          </div>

          {/* Indicador de selección múltiple */}
          {selectedSlots.length > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">
                  {selectedSlots.length} horario{selectedSlots.length > 1 ? 's' : ''} seleccionado{selectedSlots.length > 1 ? 's' : ''}
                </span>
                {selectedSlots.length === 3 && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                    Máximo alcanzado
                  </Badge>
                )}
              </div>
              {selectedSlots.length < 3 && (
                <p className="text-xs text-blue-600 mt-1">
                  Puedes seleccionar hasta {3 - selectedSlots.length} más
                </p>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-14 md:h-16 rounded-lg" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-medium">Error al cargar los horarios</p>
              <p className="text-sm text-slate-500 mt-1">
                Intenta nuevamente en unos momentos
              </p>
            </div>
          )}

          {data && (
            <div className="space-y-3">
              {data.availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No hay horarios disponibles</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Prueba con otra fecha o cancha
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {data.availableSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.start_time)
                    const isDisabled = !isSelected && selectedSlots.length >= 3

                    return (
                      <Button
                        key={slot.start_time}
                        variant="outline"
                        disabled={isDisabled}
                        onClick={() => handleSlotToggle(slot.start_time)}
                        className={cn(
                          "h-14 md:h-16 justify-between px-4 transition-all duration-200 border-2 text-left",
                          isSelected
                            ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-50"
                            : isDisabled
                              ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                              : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-base md:text-lg font-semibold">
                            {slot.display_time}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-green-600 font-medium mt-1">
                              Seleccionado
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-green-600 shrink-0" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedSlots.length > 0 && data && (
          <div className="p-4 md:p-6 border-t bg-slate-50 shrink-0">
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Horarios seleccionados:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {getSelectedSlotsData().map((slot, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {slot.display_time}
                    </Badge>
                  ))}
                </div>
              </div>
              <WhatsAppButton
                court={data.court}
                slots={getSelectedSlotsData()}
                date={date}
                className="w-full"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}