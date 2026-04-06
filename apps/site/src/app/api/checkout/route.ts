import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import { createPreference } from '@kings/payments'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, address, shipping, total } = body

    // 1. Authenticate user from session
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input minimally
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart empty' }, { status: 400 })
    }

    // 3. Mercado Pago Mock Preference Creation
    const preference = await createPreference(items, customer)

    // 4. Native Order Creation in Database
    const orderData = {
      customer_id: user.id,
      brand_origin: 'kings',
      order_type: 'direct',
      status: 'pending',
      subtotal: total - (shipping ? parseFloat(shipping.price) : 0),
      shipping_cost: shipping ? parseFloat(shipping.price) : 0,
      total: total,
      shipping_address: address,
      preference_id: preference.id, // Armazenando preference gerada
    }

    const { data: newOrder, error: orderErr } = await supabase
      .from('orders')
      .insert(orderData as any)
      .select('id')
      .single()

    if (orderErr || !newOrder) {
      console.error('Insert Order Error:', orderErr)
      return NextResponse.json({ error: 'Database failed to create order' }, { status: 500 })
    }

    // 5. Insert Order Items natively
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.id.startsWith('mock-') ? null : item.id, // Handle mock products
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }))

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsData as any)

    if (itemsErr) {
      console.error('Insert Items Error:', itemsErr)
      // Ideally we would rollback the order here or it would be in an RPC transaction
    }

    // Return the real session/order
    return NextResponse.json({
      ok: true,
      orderId: newOrder.id,
      preferenceId: preference.id,
      init_point: preference.init_point,
      detail: 'Order recorded natively in DB and preference generated'
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
