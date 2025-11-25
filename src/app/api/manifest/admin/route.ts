import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        name: 'Lo de Nachito',
        short_name: 'Lo de Nachito',
        description: 'Sistema de gestión de canchas',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    })
}
