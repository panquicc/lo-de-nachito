// src/app/api/products/[id]/components/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Obtener todos los componentes de un producto
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Verificar que el producto existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, is_composite')
      .eq('id', id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Obtener componentes del producto
    const { data: components, error } = await supabase
      .from('product_components')
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
      .eq('parent_product_id', id)
      .order('created_at')

    if (error) {
      console.error('Error fetching product components:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Transformar la respuesta
    const transformedComponents = components?.map(comp => ({
      id: comp.id,
      quantity_required: comp.quantity_required,
      component: comp.component
    })) || []

    return NextResponse.json(transformedComponents)
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST - Agregar un componente a un producto
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: parentProductId } = await params
    const { component_product_id, quantity_required } = await request.json()

    // Validaciones
    if (!component_product_id || !quantity_required) {
      return NextResponse.json(
        { error: 'component_product_id y quantity_required son requeridos' },
        { status: 400 }
      )
    }

    if (quantity_required <= 0) {
      return NextResponse.json(
        { error: 'quantity_required debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el producto padre existe y es compuesto
    const { data: parentProduct, error: parentError } = await supabase
      .from('products')
      .select('id, name, is_composite')
      .eq('id', parentProductId)
      .single()

    if (parentError || !parentProduct) {
      return NextResponse.json(
        { error: 'Producto padre no encontrado' },
        { status: 404 }
      )
    }

    if (!parentProduct.is_composite) {
      return NextResponse.json(
        { error: 'El producto debe ser marcado como compuesto para agregar componentes' },
        { status: 400 }
      )
    }

    // Verificar que el componente existe
    const { data: componentProduct, error: componentError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('id', component_product_id)
      .single()

    if (componentError || !componentProduct) {
      return NextResponse.json(
        { error: 'Producto componente no encontrado' },
        { status: 404 }
      )
    }

    if (!componentProduct.is_active) {
      return NextResponse.json(
        { error: 'El producto componente no está activo' },
        { status: 400 }
      )
    }

    // Verificar que no sea autorreferencia
    if (parentProductId === component_product_id) {
      return NextResponse.json(
        { error: 'Un producto no puede ser componente de sí mismo' },
        { status: 400 }
      )
    }

    // Verificar que no exista ya la relación
    const { data: existingComponent, error: existingError } = await supabase
      .from('product_components')
      .select('id')
      .eq('parent_product_id', parentProductId)
      .eq('component_product_id', component_product_id)
      .single()

    if (existingComponent) {
      return NextResponse.json(
        { error: 'Este producto ya es componente del producto padre' },
        { status: 400 }
      )
    }

    // Crear el componente
    const { data: newComponent, error: insertError } = await supabase
      .from('product_components')
      .insert([
        {
          parent_product_id: parentProductId,
          component_product_id,
          quantity_required: quantity_required
        }
      ])
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

    if (insertError) {
      console.error('Error creating product component:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      id: newComponent.id,
      quantity_required: newComponent.quantity_required,
      component: newComponent.component
    })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}