import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('id')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID missing' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar profile.id, pois os pedidos são salvos com customer_id = profile.id
    const { data: profile } = await supabase.from('profiles').select('id').eq('auth_id', user.id).single()

    const { data: order, error } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('customer_id', profile?.id || user.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ status: order.status })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
