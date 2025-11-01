// src/app/dashboard/kiosk/page.tsx
import KioskPOS from '@/components/kiosk/KioskPOS'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function KioskPage() {
  return (
    <div className="p-6 space-y-6">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kiosco - Punto de Venta</h1>
        <p className="text-gray-600 mt-2">Registra ventas del kiosco</p>
      </div>

      <KioskPOS />
    </div>
  )
}