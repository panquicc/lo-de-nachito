// src/components/availability/WhatsAppButton.tsx
import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  court: any
  slot: {
    start_time: string
    end_time: string
    display_time: string
  }
  date: Date
}

export function WhatsAppButton({ court, slot, date }: WhatsAppButtonProps) {
  const generateWhatsAppMessage = () => {
    const message = `Me gustaría solicitar un turno:\n\n` +
      `🏟️ Cancha: ${court.name}\n` +
      `📅 Fecha: ${date.toLocaleDateString('es-ES')}\n` +
      `⏰ Horario: ${slot.display_time}\n` +
      `🎾 Tipo: ${court.type}\n\n` +
      `Por favor, confirmen disponibilidad. ¡Gracias!`
    
    return encodeURIComponent(message)
  }

  // Reemplaza con el número de teléfono del negocio
  const phoneNumber = '5493764252615'

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${generateWhatsAppMessage()}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      Solicitar Turno por WhatsApp
    </a>
  )
}