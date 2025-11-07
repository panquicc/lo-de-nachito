// src/app/api/products/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
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
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transformar los datos para que sean más fáciles de usar en el frontend
    const transformedProducts = products?.map(product => ({
      ...product,
      components: product.product_components?.map((comp: { id: any; quantity_required: any; component: any }) => ({
        id: comp.id,
        quantity_required: comp.quantity_required,
        component: comp.component
      })) || []
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const productData = await request.json()

    // Validar campos requeridos
    if (!productData.name || productData.price === undefined) {
      return NextResponse.json(
        { error: 'Nombre y precio son campos requeridos' }, 
        { status: 400 }
      )
    }

    // Preparar datos con valores por defecto
    const productToInsert = {
      name: productData.name,
      price: productData.price,
      cost_price: productData.cost_price || null,
      stock: productData.stock ?? 0,
      is_active: productData.is_active ?? true,
      rotation_rate: productData.rotation_rate || 'medium',
      min_stock: productData.min_stock || 0,
      is_composite: productData.is_composite || false,
      track_stock: productData.track_stock ?? true,
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert([productToInsert])
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
      console.error('Error creating product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transformar la respuesta
    const transformedProduct = {
      ...product,
      components: product.product_components?.map((comp: { id: any; quantity_required: any; component: any }) => ({
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