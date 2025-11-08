// src/app/api/products/[id]/components/[componentId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT - Actualizar cantidad de un componente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: parentProductId, componentId } = await params
    const { quantity_required } = await request.json()

    // Validaciones
    if (!quantity_required || quantity_required <= 0) {
      return NextResponse.json(
        { error: 'quantity_required debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el componente existe
    const { data: existingComponent, error: fetchError } = await supabase
      .from('product_components')
      .select(`
        id,
        parent_product_id,
        component_product_id
      `)
      .eq('id', componentId)
      .eq('parent_product_id', parentProductId)
      .single()

    if (fetchError || !existingComponent) {
      return NextResponse.json(
        { error: 'Componente no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el componente
    const { data: updatedComponent, error: updateError } = await supabase
      .from('product_components')
      .update({
        quantity_required: quantity_required,
        updated_at: new Date().toISOString()
      })
      .eq('id', componentId)
      .select(`
        id,
        quantity_required,
        component:component_product_id (
          id,
          name,
          price,
          cost_price,
          stock,
          track_stock,
          is_active
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating product component:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      id: updatedComponent.id,
      quantity_required: updatedComponent.quantity_required,
      component: updatedComponent.component
    })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un componente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; componentId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: parentProductId, componentId } = await params

    // Verificar que el componente existe
    const { data: existingComponent, error: fetchError } = await supabase
      .from('product_components')
      .select('id')
      .eq('id', componentId)
      .eq('parent_product_id', parentProductId)
      .single()

    if (fetchError || !existingComponent) {
      return NextResponse.json(
        { error: 'Componente no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el componente
    const { error: deleteError } = await supabase
      .from('product_components')
      .delete()
      .eq('id', componentId)

    if (deleteError) {
      console.error('Error deleting product component:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Componente eliminado correctamente'
    })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}