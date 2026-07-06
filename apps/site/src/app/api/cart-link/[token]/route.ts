import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params
  if (!token || token.length < 8) {
    return NextResponse.json({ error: 'Link inválido' }, { status: 404 })
  }

  const supabase = createAdminClient()

  const { data: link, error } = await supabase
    .from('cart_links')
    .select('id, items, coupon_code, discount, customer_name, expires_at, used_at')
    .eq('token', token)
    .single()

  if (error || !link) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  // Verificar expiração
  if (new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este link expirou' }, { status: 410 })
  }

  // Link já usado — ainda permitir acesso (pode abrir novamente)
  // mas informar que já foi utilizado
  return NextResponse.json({
    items: link.items,
    coupon_code: link.coupon_code,
    discount: link.discount,
    customer_name: link.customer_name,
    used: !!link.used_at,
  })
}
