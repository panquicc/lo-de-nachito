import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        name: 'Turnos Lo de Nachito',
        short_name: 'Turnos Nachito',
        description: 'Reserva tu cancha en Lo de Nachito',
        start_url: '/disponibles',
        scope: '/disponibles',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
    })
}
