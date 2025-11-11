// src/types/booking.ts

export interface Booking {
    id: string;
    court_id: string;
    client_id: string | null;
    start_time: Date; // Siempre en hora argentina
    end_time: Date;   // Siempre en hora argentina
    status: string;
    amount: number;
    created_at: Date; // Siempre en hora argentina
    updated_at: Date; // Siempre en hora argentina
    cash_amount: number;
    mercado_pago_amount: number;
    hour_price: number;
    deposit_amount: number;
    payment_method: 'EFECTIVO' | 'MERCADO_PAGO' | 'MIXTO' | 'PENDIENTE';
    notes?: string;
    // Campos adicionales para display
    display_date?: string; // Formateado para mostrar
    display_time?: string; // Formateado para mostrar
} 

export interface BookinBD {
    id: string;
    court_id: string;
    client_id: string | null;
    start_time: string; // En UTC
    end_time: string;   // En UTC
    status: string;
    amount: number;
    notes?: string;
    created_at: string; // En UTC
    payment_method: 'EFECTIVO' | 'MERCADO_PAGO' | 'MIXTO' | 'PENDIENTE';
    cash_amount: number;
    mercado_pago_amount: number;
    hour_price: number;
    deposit_amount: number;
}