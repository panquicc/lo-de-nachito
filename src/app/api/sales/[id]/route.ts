import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // 1. Obtener los items de la venta para restaurar stock
        const { data: saleItems, error: itemsError } = await supabase
            .from('sale_items')
            .select(`
        product_id,
        quantity,
        products (
          id,
          track_stock,
          is_composite,
          stock
        )
      `)
            .eq('sale_id', id)

        if (itemsError) {
            return NextResponse.json({ error: itemsError.message }, { status: 400 })
        }

        // 2. Restaurar stock
        if (saleItems) {
            for (const item of saleItems) {
                // Supabase puede devolver un array o un objeto dependiendo de la query.
                // Forzamos el tipo a any para acceder a las propiedades sin error de TS.
                const product = Array.isArray(item.products) ? item.products[0] : item.products as any

                if (!product) continue

                // Restaurar stock de producto simple
                if (product.track_stock && !product.is_composite && product.stock !== null) {
                    await supabase
                        .from('products')
                        .update({ stock: product.stock + item.quantity })
                        .eq('id', product.id)
                }

                // Restaurar stock de producto compuesto
                if (product.is_composite) {
                    await restoreCompositeStock(supabase, product.id, item.quantity)
                }
            }
        }

        // 3. Eliminar la venta (Cascade debería eliminar sale_items)
        const { error: deleteError } = await supabase
            .from('sales')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting sale:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params
        const updates = await request.json()

        // Solo permitimos actualizar ciertos campos por seguridad
        const allowedUpdates: any = {}
        if (updates.payment_method) allowedUpdates.payment_method = updates.payment_method
        if (updates.client_id !== undefined) allowedUpdates.client_id = updates.client_id

        const { data, error } = await supabase
            .from('sales')
            .update(allowedUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

async function restoreCompositeStock(supabase: any, productId: string, quantity: number) {
    const { data: components } = await supabase
        .from('product_components')
        .select('component_product_id, quantity_required')
        .eq('parent_product_id', productId)

    if (!components) return

    for (const component of components) {
        const componentQty = quantity * component.quantity_required

        const { data: compProduct } = await supabase
            .from('products')
            .select('stock, track_stock')
            .eq('id', component.component_product_id)
            .single()

        if (compProduct && compProduct.track_stock && compProduct.stock !== null) {
            await supabase
                .from('products')
                .update({ stock: compProduct.stock + componentQty })
                .eq('id', component.component_product_id)
        }
    }
}
