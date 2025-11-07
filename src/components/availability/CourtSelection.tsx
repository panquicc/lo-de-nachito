// src/components/availability/CourtSelection.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Check, CalendarDays } from 'lucide-react'
import { Court } from '@/lib/api/courts'
import { cn } from '@/lib/utils'

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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  const activeCourts = courts.filter(court => court.is_active)

  if (activeCourts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No hay canchas disponibles en este momento
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeCourts.map((court) => (
          <div
            key={court.id}
            onClick={() => onCourtSelect(court.id)}
            className={cn(
              "group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden",
              "hover:scale-[1.02] hover:shadow-lg",
              selectedCourt === court.id
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md"
                : "border-slate-200 bg-white hover:border-blue-300"
            )}
          >
            {/* Efecto de fondo sutil */}
            <div className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-300",
              selectedCourt === court.id && "opacity-100",
              "bg-gradient-to-br from-blue-500/5 to-cyan-500/5"
            )} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    selectedCourt === court.id 
                      ? "bg-blue-100 text-blue-600" 
                      : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                  )}>
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {court.name}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">
                      {court.type.toLowerCase()}
                    </p>
                  </div>
                </div>
                
                {selectedCourt === court.id && (
                  <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className={cn(
                "text-xs font-medium px-2 py-1 rounded-full w-fit transition-all",
                selectedCourt === court.id
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700"
              )}>
                {selectedCourt === court.id ? "Seleccionada" : "Haz clic para seleccionar"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}