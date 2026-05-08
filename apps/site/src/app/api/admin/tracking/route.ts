import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { orderId, trackingCode } = await req.json()
    
    if (!orderId) {
      return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // If trackingCode provided, update the order
    if (trackingCode !== undefined) {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_code: trackingCode || null,
          status: trackingCode ? 'shipped' : 'paid'
        })
        .eq('id', orderId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, message: 'Rastreio atualizado com sucesso' })
    }

    // If no trackingCode, just fetch current order tracking info
    const { data: order } = await supabase
      .from('orders')
      .select('tracking_code')
      .eq('id', orderId)
      .single()

    if (!order?.tracking_code) {
      return NextResponse.json({ tracking_code: null, status: 'Sem rastreio' })
    }

    // Try to get tracking info from Frenet
    const token = process.env.FRENET_TOKEN_KINGS
    if (token) {
      try {
        const res = await fetch('https://api.frenet.com.br/tracking/trackinginfo', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'token': token
          },
          body: JSON.stringify({
            TrackingNumber: order.tracking_code,
            ShippingServiceCode: '03220',
            CarrierCode: 'COR'
          })
        })

        if (res.ok) {
          const frenetData = await res.json()
          return NextResponse.json({
            tracking_code: order.tracking_code,
            tracking_url: frenetData.TrackingUrl || null,
            expected_date: frenetData.ExpectedDate || null,
            error_message: frenetData.ErrorMessage || null,
          })
        }
      } catch (e) {
        console.error('[Tracking] Frenet lookup failed:', e)
      }
    }

    return NextResponse.json({ tracking_code: order.tracking_code })
  } catch (error: any) {
    console.error('[Tracking] Error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
