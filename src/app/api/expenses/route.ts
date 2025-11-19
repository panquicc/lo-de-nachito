import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const category = searchParams.get('category')

        let query = supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false })

        if (startDate) {
            query = query.gte('date', startDate)
        }

        if (endDate) {
            query = query.lte('date', endDate)
        }

        if (category) {
            query = query.eq('category', category)
        }

        const { data: expenses, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(expenses)
    } catch (error) {
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const expenseData = await request.json()

        const { data: expense, error } = await supabase
            .from('expenses')
            .insert([expenseData])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(expense)
    } catch (error) {
        return NextResponse.json({ error: 'Error creando gasto' }, { status: 500 })
    }
}
