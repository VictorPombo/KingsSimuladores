import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import { createPreference } from '@kings/payments'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, address, shipping, total, coupon_id } = body

    // 1. Authenticate user from session
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_id', user.id).single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
    }

    // 2. Validate input minimally
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart empty' }, { status: 400 })
    }

    // 2.5. Deduce and Validate Store Context
    const firstStore = items[0].storeOrigin || 'kings'
    const isMixed = items.some((item: any) => (item.storeOrigin || 'kings') !== firstStore)
    
    if (isMixed) {
      return NextResponse.json({ error: 'Mixed cart is not allowed' }, { status: 400 })
    }

    const storeContext = firstStore === 'seven' ? 'seven' : (firstStore === 'msu' ? 'msu' : 'kings')

    // 3. Native Order Creation in Database FIRST to get an ID
    const orderData = {
      customer_id: profile.id,
      brand_origin: storeContext,
      order_type: 'direct',
      status: 'pending',
      subtotal: total - (shipping ? parseFloat(shipping.price) : 0),
      shipping_cost: shipping ? parseFloat(shipping.price) : 0,
      total: total,
      shipping_address: address,
      preference_id: null,
      coupon_id: coupon_id || null,
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

    // 4. Mercado Pago Preference Creation with External Reference
    const preference = await createPreference(items, customer, newOrder.id, undefined, storeContext)

    // 4.5. Update Order with Preference ID
    if (preference.id) {
       await supabase.from('orders').update({ preference_id: preference.id }).eq('id', newOrder.id)
    }

    // 5. Insert Order Items natively
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.id,
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
