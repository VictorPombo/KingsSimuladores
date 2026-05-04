import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import { createAdminClient } from '@kings/db'
import { sendEmailMessage } from '@kings/notifications'

export async function POST(req: Request) {
  try {
    const { payoutId, trackingCode } = await req.json()
    if (!payoutId || !trackingCode) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = createAdminClient()

    // 1. Validar a Sessão
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // 2. Verificar posse do Payout
    const { data: payout } = await supabaseAdmin
      .from('payouts')
      .select('id, seller_id, order_item_id, order_item:order_items( order_id, product:products(title) )')
      .eq('id', payoutId)
      .single()

    if (!payout || payout.seller_id !== session.user.id) {
      return NextResponse.json({ error: 'Repasse não encontrado ou sem permissão.' }, { status: 404 })
    }

    // 3. Atualizar a tabela payouts com o código e a data
    const { error: updateErr } = await supabaseAdmin
      .from('payouts')
      .update({ 
        tracking_code: trackingCode,
        shipped_at: new Date().toISOString()
      })
      .eq('id', payoutId)

    if (updateErr) {
      throw new Error('Falha ao salvar no banco: ' + updateErr.message)
    }

    // 4. Buscar os dados do Comprador para o E-mail
    try {
      const orderItem = payout.order_item as any
      const orderId = orderItem?.order_id
      const productTitle = orderItem?.product?.title || 'Seu Equipamento'

      if (orderId) {
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('customer_id')
          .eq('id', orderId)
          .single()

        if (order?.customer_id) {
          const { data: buyerProfile } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', order.customer_id)
            .single()

          if (buyerProfile && buyerProfile.email) {
            // 5. Disparar o e-mail pro Comprador
            const KINGS_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'
            const html = `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 30px;">
    <h1 style="color: #fff; margin-bottom: 20px;">Seu pedido está a caminho! 🚚</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Boas notícias, <strong>${buyerProfile.full_name?.split(' ')[0] || 'Piloto'}</strong>! 
      O vendedor acabou de despachar o seu <strong>${productTitle}</strong>.
    </p>
    
    <div style="background-color: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #71717a; font-size: 14px;">Código de Rastreio:</p>
      <h2 style="margin: 5px 0 0 0; color: #22c55e; font-size: 24px; letter-spacing: 2px;">${trackingCode}</h2>
    </div>

    <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 30px;">
      Acompanhe a entrega pelo site da transportadora. Assim que a caixa chegar e você testar, lembre-se de clicar em "Confirmar Recebimento" no seu painel para liberar o pagamento do vendedor!
    </p>
    
    <a href="${KINGS_URL}/account" style="display: inline-block; background-color: #E8002D; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Acompanhar Pedido
    </a>
  </div>
</div>`
            
            await sendEmailMessage({
              to: buyerProfile.email,
              subject: `Seu pedido foi despachado! 🚚 (Cód: ${trackingCode})`,
              html
            })
            console.log(`[Rastreio] E-mail de postagem enviado para o comprador: ${buyerProfile.email}`)
          }
        }
      }
    } catch (emailErr) {
      console.error('[Rastreio] Falha silenciosa ao enviar email:', emailErr)
      // Não quebramos o endpoint se apenas o email falhar
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Rastreio API Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
