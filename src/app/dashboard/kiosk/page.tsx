// src/app/dashboard/kiosk/page.tsx
import KioskPOS from '@/components/kiosk/KioskPOS'

export default function KioskPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header responsivo */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kiosco - Punto de Venta</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Registra ventas del kiosco</p>
      </div>

      <KioskPOS />
    </div>
  )
}