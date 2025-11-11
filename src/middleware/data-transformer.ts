// src/middleware/data-transformer.ts

import { NextRequest, NextResponse } from "next/server"; 
import { ArgentinaDateUtils } from "@/lib/date-utils";

export function dateTransformerMiddleware(req: NextRequest) {
    // Solo aplicar a rutas API que manejen bookings 
    if (!req.nextUrl.pathname.startsWith('/api/bookings')) {
        return NextResponse.next(); 
    }

    // Clonar el request para modificar el body 
    const response = NextResponse.next();

    // Interceptar la respuesta para transformar las fechas
    if (['POST', 'PUT'].includes(req.method)) {
        // Manejar en el route handler
    }

    return response;
}