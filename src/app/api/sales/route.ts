// src/app/api/sales/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('sales')
      .select(`
        *,
        clients (name),
        sale_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .order('created_at', { ascending: false })

    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      
      query = query
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString())
    }

    const { data: sales, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { sale, items, bookingId } = await request.json()

    // **NUEVO: Validar stock antes de procesar la venta**
    const stockValidation = await validateStock(supabase, items)
    if (!stockValidation.isValid) {
      return NextResponse.json(
        { error: stockValidation.error },
        { status: 400 }
      )
    }

    // Crear la venta (tu lógica original)
    const { data: newSale, error: saleError } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single()

    if (saleError) {
      return NextResponse.json({ error: saleError.message }, { status: 400 })
    }

    // Crear los items de venta (tu lógica original)
    const saleItems = items.map((item: any) => ({
      ...item,
      sale_id: newSale.id
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      // Rollback: eliminar la venta si hay error en los items
      await supabase.from('sales').delete().eq('id', newSale.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    // **NUEVO: Procesar productos compuestos después de crear la venta**
    await processCompositeProducts(supabase, items, newSale.id)

    // Asociar con booking si existe (tu lógica original)
    if (bookingId) {
      const { error: bookingSaleError } = await supabase
        .from('booking_sales')
        .insert([{ booking_id: bookingId, sale_id: newSale.id }])

      if (bookingSaleError) {
        console.error('Error asociando venta con turno:', bookingSaleError)
      }
    }

    // Obtener la venta completa con relaciones (tu lógica original)
    const { data: completeSale, error: completeError } = await supabase
      .from('sales')
      .select(`
        *,
        clients (name),
        sale_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq('id', newSale.id)
      .single()

    if (completeError) {
      return NextResponse.json({ error: completeError.message }, { status: 400 })
    }

    return NextResponse.json(completeSale)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// **NUEVAS FUNCIONES PARA PRODUCTOS COMPUESTOS**

/**
 * Valida el stock de productos normales y compuestos
 */
async function validateStock(supabase: any, items: any[]) {
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('id, name, stock, track_stock, is_composite')
      .eq('id', item.product_id)
      .single()

    if (!product) {
      return { 
        isValid: false, 
        error: `Producto no encontrado: ${item.product_id}` 
      }
    }

    // Validar stock de producto normal
    if (product.track_stock && product.stock !== null && product.stock < item.quantity) {
      return { 
        isValid: false, 
        error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
      }
    }

    // Validar stock de productos compuestos
    if (product.is_composite) {
      const componentValidation = await validateCompositeStock(supabase, product.id, item.quantity)
      if (!componentValidation.isValid) {
        return componentValidation
      }
    }
  }

  return { isValid: true }
}

/**
 * Valida stock de componentes de productos compuestos
 */
async function validateCompositeStock(supabase: any, productId: string, quantity: number) {
  const { data: components } = await supabase
    .from('product_components')
    .select(`
      quantity_required,
      component:component_product_id (
        id, name, stock, track_stock
      )
    `)
    .eq('parent_product_id', productId)

  if (!components) {
    return { isValid: true }
  }

  for (const component of components) {
    const compProduct = component.component
    const requiredQty = quantity * component.quantity_required

    if (compProduct.track_stock && compProduct.stock !== null && compProduct.stock < requiredQty) {
      return {
        isValid: false,
        error: `Stock insuficiente en componente: ${compProduct.name}. Se necesitan ${requiredQty}, hay ${compProduct.stock}`
      }
    }
  }

  return { isValid: true }
}

/**
 * Procesa los componentes de productos compuestos después de la venta
 */
async function processCompositeProducts(supabase: any, items: any[], saleId: string) {
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('is_composite')
      .eq('id', item.product_id)
      .single()

    if (product?.is_composite) {
      await processCompositeComponents(supabase, item.product_id, item.quantity, saleId)
    }
  }
}

/**
 * Actualiza stock y registra movimientos para componentes de productos compuestos
 */
async function processCompositeComponents(supabase: any, productId: string, quantity: number, saleId: string) {
  const { data: components } = await supabase
    .from('product_components')
    .select('component_product_id, quantity_required')
    .eq('parent_product_id', productId)

  if (!components) return

  for (const component of components) {
    const componentQty = quantity * component.quantity_required

    // Obtener información del componente
    const { data: compProduct } = await supabase
      .from('products')
      .select('stock, track_stock, cost_price, name')
      .eq('id', component.component_product_id)
      .single()

    if (!compProduct) continue

    // Actualizar stock del componente si lleva control
    if (compProduct.track_stock && compProduct.stock !== null) {
      const newStock = compProduct.stock - componentQty

      await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', component.component_product_id)

      // Registrar movimiento de stock
      await supabase
        .from('stock_movements')
        .insert([
          {
            product_id: component.component_product_id,
            movement_type: 'composite_usage',
            quantity: componentQty,
            unit_price: 0, // No se vende directamente al cliente
            cost_price: compProduct.cost_price,
            related_sale_id: saleId,
            notes: `Uso como componente en venta ${saleId}`
          }
        ])
    }
  }
}