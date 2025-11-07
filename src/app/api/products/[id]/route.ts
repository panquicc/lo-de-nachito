// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_components!parent_product_id (
          id,
          quantity_required,
          component:component_product_id (
            id,
            name,
            price,
            cost_price,
            stock
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Transformar los datos
    const transformedProduct = {
      ...product,
      components: product.product_components?.map((comp: any) => ({
        id: comp.id,
        quantity_required: comp.quantity_required,
        component: comp.component
      })) || []
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const updates = await request.json()
    const { id } = await params

    // Validar que el producto existe
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Preparar datos para actualizar
    const productToUpdate = {
      name: updates.name,
      price: updates.price,
      cost_price: updates.cost_price,
      stock: updates.stock,
      is_active: updates.is_active,
      rotation_rate: updates.rotation_rate,
      min_stock: updates.min_stock,
      is_composite: updates.is_composite,
      track_stock: updates.track_stock,
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(productToUpdate)
      .eq('id', id)
      .select(`
        *,
        product_components!parent_product_id (
          id,
          quantity_required,
          component:component_product_id (
            id,
            name,
            price,
            cost_price,
            stock
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transformar la respuesta
    const transformedProduct = {
      ...product,
      components: product.product_components?.map((comp: any) => ({
        id: comp.id,
        quantity_required: comp.quantity_required,
        component: comp.component
      })) || []
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Verificar si el producto tiene componentes asociados
    const { data: components, error: componentsError } = await supabase
      .from('product_components')
      .select('id')
      .eq('parent_product_id', id)

    if (componentsError) {
      console.error('Error checking product components:', componentsError)
      return NextResponse.json({ error: componentsError.message }, { status: 400 })
    }

    // Si tiene componentes, eliminarlos primero
    if (components && components.length > 0) {
      const { error: deleteComponentsError } = await supabase
        .from('product_components')
        .delete()
        .eq('parent_product_id', id)

      if (deleteComponentsError) {
        console.error('Error deleting product components:', deleteComponentsError)
        return NextResponse.json({ error: deleteComponentsError.message }, { status: 400 })
      }
    }

    // Verificar si el producto es componente de otros productos
    const { data: parentComponents, error: parentError } = await supabase
      .from('product_components')
      .select('id, parent_product_id')
      .eq('component_product_id', id)

    if (parentError) {
      console.error('Error checking parent components:', parentError)
      return NextResponse.json({ error: parentError.message }, { status: 400 })
    }

    // Si es componente de otros productos, no permitir eliminación
    if (parentComponents && parentComponents.length > 0) {
      const parentIds = parentComponents.map(pc => pc.parent_product_id)
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el producto porque es componente de otros productos',
          parentProducts: parentIds
        }, 
        { status: 400 }
      )
    }

    // Finalmente eliminar el producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Producto eliminado correctamente'
    })
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}