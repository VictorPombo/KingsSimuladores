import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'
import { sendWhatsappMessage } from '@kings/notifications'

export async function POST(req: Request) {
  try {
    const { product_id } = await req.json()
    if (!product_id) {
      return NextResponse.json({ error: 'product_id não fornecido' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Validar se é admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar pendentes deste produto e informações do produto
    const { data: waitlist } = await supabase
      .from('waitlist')
      .select('*, product:product_id(title, slug)')
      .eq('product_id', product_id)
      .eq('status', 'pending')

    if (!waitlist || waitlist.length === 0) {
      return NextResponse.json({ error: 'Nenhum cliente pendente para este produto' }, { status: 400 })
    }

    const productInfo = waitlist[0].product
    const baseUrl = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'
    const productLink = `${baseUrl}/produtos/${productInfo.slug}`

    let notifiedCount = 0

    // Enviar mensagens e atualizar status
    for (const item of waitlist) {
      const msg = `Olá ${item.customer_name}, o produto *${productInfo.title}* que você estava esperando acabou de voltar ao nosso estoque! Corra para garantir o seu antes que acabe novamente:\n\n🔗 ${productLink}`
      
      const response = await sendWhatsappMessage({
        phone: item.customer_phone,
        message: msg
      })

      // Atualiza banco independentemente de ter credentials completas de chatwoot ou nao
      // pois no desenvolvimento o sendWhatsappMessage loga um warning e simula o envio
      await supabase
        .from('waitlist')
        .update({ status: 'notified', notified_at: new Date().toISOString() })
        .eq('id', item.id)

      notifiedCount++
    }

    return NextResponse.json({ success: true, count: notifiedCount })
  } catch (err: any) {
    console.error('Waitlist Trigger Error:', err)
    return NextResponse.json({ error: 'Erro interno ao disparar mensagens' }, { status: 500 })
  }
}
