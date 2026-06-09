import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import { createAdminClient } from '@kings/db'

export async function POST(req: Request) {
  try {
    const { payoutId } = await req.json()
    if (!payoutId) {
      return NextResponse.json({ error: 'ID do repasse é obrigatório.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = createAdminClient()

    // 1. Validar a Sessão do Comprador
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    // 2. Verificar posse do pedido (Proteção contra IDOR)
    const { data: payout } = await supabaseAdmin
      .from('payouts')
      .select('id, status, order_item:order_items( order:orders( customer_id ) )')
      .eq('id', payoutId)
      .single()

    if (!payout) {
      return NextResponse.json({ error: 'Repasse não encontrado.' }, { status: 404 })
    }

    if (payout.status !== 'held') {
      return NextResponse.json({ error: 'Repasse não está retido ou já foi liberado.' }, { status: 400 })
    }

    // Para confirmar o recebimento, o comprador do item DEVE ser o usuário autenticado
    // Em nosso sistema, customer_id no pedido aponta para profiles.id
    // Precisamos pegar o profile do usuário logado:
    const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('auth_id', session.user.id).single()
    const customerId = (payout.order_item as any)?.order?.customer_id

    if (!profile || profile.id !== customerId) {
      return NextResponse.json({ error: 'Apenas o comprador do item pode confirmar o recebimento.' }, { status: 403 })
    }

    // 3. Executar Liberação (Escrow -> Available)
    const { error: updateErr } = await supabaseAdmin
      .from('payouts')
      .update({ status: 'available' })
      .eq('id', payoutId)

    if (updateErr) {
      throw new Error('Falha ao atualizar status: ' + updateErr.message)
    }

    // 4. Notificar vendedor que o escrow foi liberado
    try {
      const { sendEmailMessage } = await import('@kings/notifications')
      const { data: payoutData } = await supabaseAdmin
        .from('payouts')
        .select('seller_id, net_amount, order_item:order_items(product:products(title))')
        .eq('id', payoutId)
        .single()

      if (payoutData?.seller_id) {
        const { data: sellerProfile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('id', payoutData.seller_id)
          .single()

        if (sellerProfile?.email) {
          const productTitle = (payoutData.order_item as any)?.product?.title || 'seu equipamento'
          const netAmount = payoutData.net_amount || 0
          const MSU_URL = process.env.NEXT_PUBLIC_URL_MSU || 'https://kingssimuladores.com.br/usado'

          await sendEmailMessage({
            to: sellerProfile.email,
            subject: '✅ Entrega confirmada! Seu pagamento será liberado.',
            html: `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 30px;">
    <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
    <h1 style="color: #fff; margin-bottom: 20px;">Entrega Confirmada!</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Boa notícia, <strong>${sellerProfile.full_name?.split(' ')[0] || 'Piloto'}</strong>!
      O comprador confirmou o recebimento do <strong>${productTitle}</strong>.
    </p>
    <div style="background: rgba(16,185,129,0.08); border: 1px dashed rgba(16,185,129,0.3); border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #71717a; font-size: 14px;">Valor a receber:</p>
      <h2 style="margin: 5px 0 0 0; color: #10b981; font-size: 28px;">R$ ${netAmount.toFixed(2).replace('.', ',')}</h2>
      <p style="margin: 8px 0 0 0; color: #71717a; font-size: 12px;">O repasse será efetuado pela equipe Kings em até 48h úteis.</p>
    </div>
    <a href="${MSU_URL}/dashboard?tab=finance" style="display: inline-block; background-color: #10b981; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Ver Meu Financeiro
    </a>
  </div>
</div>`
          })
          console.log(`[Escrow] Email de liberação enviado para ${sellerProfile.email}`)
        }
      }
    } catch (emailErr) {
      console.error('[Escrow] Falha ao enviar email de liberação:', emailErr)
    }

    console.log(`[Escrow] Pagamento ${payoutId} liberado pelo comprador ${profile.id}.`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Escrow API Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
