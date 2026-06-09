import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Verificar se o produto existe e pertence ao usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('auth_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const { data: product } = await supabase
      .from('products')
      .select('id, title, seller_id')
      .eq('id', productId)
      .single()

    if (!product || product.seller_id !== profile.id) {
      return NextResponse.json({ error: 'Produto inválido ou não pertence a você' }, { status: 403 })
    }

    // Usar Token do Mercado Pago do MSU/Kings
    const MP_TOKEN = process.env.MP_ACCESS_TOKEN_KINGS || process.env.MP_ACCESS_TOKEN
    
    // Gerar Preference no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            id: `destaque_${product.id}`,
            title: `Destaque Premium - MSU: ${product.title}`,
            description: 'Taxa de Destaque para anúncio no Meu Simulador Usado',
            quantity: 1,
            currency_id: 'BRL',
            unit_price: 30.00
          }
        ],
        payer: {
          email: profile.email || 'cliente@msu.com.br',
          name: profile.full_name?.split(' ')[0] || 'Cliente'
        },
        external_reference: `bump_${product.id}`,
        // Use back_urls to return to the dashboard
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/usado/dashboard?tab=ads&payment=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/usado/dashboard?tab=ads&payment=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/usado/dashboard?tab=ads&payment=pending`
        },
        auto_return: 'approved'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Destacar API] MP Error:', errorData)
      return NextResponse.json({ error: 'Falha ao gerar cobrança no Mercado Pago' }, { status: 500 })
    }

    const preference = await response.json()

    // O sandbox init_point é o ideal para .env.test e desenvolvimento
    const isTest = process.env.NODE_ENV !== 'production' || MP_TOKEN?.startsWith('TEST-')
    const init_point = isTest ? preference.sandbox_init_point : preference.init_point

    return NextResponse.json({
      success: true,
      preferenceId: preference.id,
      init_point: init_point
    })

  } catch (err: any) {
    console.error('[Destacar API] Erro interno:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
