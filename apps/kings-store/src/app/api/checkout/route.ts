import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

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

    // 3. Fake Order Creation in Database
    const orderId = crypto.randomUUID()
    const mockOrder = {
      id: orderId,
      customer_id: user.id,
      brand_origin: 'kings',
      order_type: 'direct',
      status: 'pending',
      subtotal: total - (shipping ? parseFloat(shipping.price) : 0),
      shipping_cost: shipping ? parseFloat(shipping.price) : 0,
      total: total,
      shipping_address: address,
      created_at: new Date().toISOString(),
    }

    await supabase.from('orders').insert(mockOrder as any)
    
    // In actual implementation we would also insert `order_items`.

    // Return the fake session/order
    return NextResponse.json({
      ok: true,
      orderId: orderId,
      detail: 'Mock order created successfully via frontend POST'
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
