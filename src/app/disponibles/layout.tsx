import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reservar Cancha - Lo de Nachito',
    description: 'Reserva tu turno de forma rápida y sencilla',
    manifest: '/api/manifest/disponibles',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Turnos Nachito',
    },
}

export default function DisponiblesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
