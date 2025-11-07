// src/components/availability/CourtSelection.tsx
import { Court } from '@/lib/api/courts'

interface CourtSelectionProps {
  courts: Court[]
  selectedCourt: string
  onCourtSelect: (courtId: string) => void
  isLoading: boolean
}

export function CourtSelection({ 
  courts, 
  selectedCourt, 
  onCourtSelect, 
  isLoading 
}: CourtSelectionProps) {
  if (isLoading) {
    return <div className="text-center py-4">Cargando canchas...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Elige tu Cancha
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courts.filter(court => court.is_active).map((court) => (
          <div
            key={court.id}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedCourt === court.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => onCourtSelect(court.id)}
          >
            <h3 className="text-xl font-semibold mb-2">{court.name}</h3>
            <p className="text-gray-600 capitalize">{court.type.toLowerCase()}</p>
            {selectedCourt === court.id && (
              <div className="mt-3 text-sm text-blue-600 font-medium">
                ✓ Seleccionada
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}