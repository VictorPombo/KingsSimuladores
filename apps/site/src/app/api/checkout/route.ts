import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import { createPreference } from '@kings/payments'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { items, customer, address, shipping, total, coupon_id } = body

    // 1. Authenticate user from session
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user) {
      console.error('[Checkout API] Unauthorized error. Auth Error:', authError)
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

    // Permite itens misturados livremente. A lógica define o storeContext com base no primeiro item.
    const firstStore = items[0].storeOrigin || 'kings'

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
    const preference = await createPreference(items, customer, newOrder.id, undefined, storeContext, orderData.shipping_cost)

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
      store_origin: item.storeOrigin || 'kings',
    }))

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsData as any)

    if (itemsErr) {
      console.error('Insert Items Error:', itemsErr)
      // Ideally we would rollback the order here or it would be in an RPC transaction
    }

    // 6. MSU Marketplace Segregation (Escrow Model)
    if (storeContext === 'msu') {
      const { data: brand } = await supabase.from('brands').select('settings').eq('name', 'msu').single()
      // Fallback para 15% conforme regra de negócio oficial, se não houver na tabela
      let commissionRate = 15; 
      if (brand?.settings?.commission_rate !== undefined) {
        commissionRate = Number(brand.settings.commission_rate);
      }

      for (const item of items) {
        // Obter seller_id do produto anunciado
        const { data: listing } = await supabase.from('marketplace_listings').select('seller_id').eq('id', item.id).single()
        
        if (listing?.seller_id) {
          const itemTotal = item.price * item.quantity
          const kingsFee = (itemTotal * commissionRate) / 100
          const sellerNet = itemTotal - kingsFee

          await supabase.from('marketplace_orders').insert({
            buyer_id: profile.id,
            seller_id: listing.seller_id,
            listing_id: item.id,
            total_price: itemTotal,
            commission_rate: commissionRate,
            kings_fee: kingsFee,
            seller_net: sellerNet,
            status: 'awaiting_payment',
            mp_preference_id: preference.id, // Vínculo principal para o webhook antigo (caso falhe o order_id)
            order_id: newOrder.id // Novo vínculo estrutural criado na migration 010
          })
        }
      }
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
