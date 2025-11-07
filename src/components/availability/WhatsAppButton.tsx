// src/components/availability/WhatsAppButton.tsx
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppButtonProps {
  court: any
  slots: Array<{
    start_time: string
    end_time: string
    display_time: string
  }>
  date: Date
  className?: string
}

export function WhatsAppButton({ court, slots, date, className }: WhatsAppButtonProps) {
  const generateWhatsAppMessage = () => {
    const formattedDate = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const selectedTimesText = slots.map(slot => slot.display_time).join(', ')
    
    const message = `¡Hola! Me gustaría reservar la cancha:\n\n` +
      `🏟️ *Cancha:* ${court.name}\n` +
      `📅 *Fecha:* ${formattedDate}\n` +
      `⏰ *Horario${slots.length > 1 ? 's' : ''}:* ${selectedTimesText}\n` +
      `🎾 *Tipo:* ${court.type}\n\n` +
      `Por favor, confirmen disponibilidad y procedimiento de reserva. ¡Gracias!`
    
    return encodeURIComponent(message)
  }

  // Número de teléfono del negocio
  const phoneNumber = '5493764252615'

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${generateWhatsAppMessage()}`

  return (
    <Button
      asChild
      className={cn(
        "w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors",
        className
      )}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="h-5 w-5" />
        Solicitar {slots.length > 1 ? `${slots.length} Turnos` : 'Turno'} por WhatsApp
      </a>
    </Button>
  )
}