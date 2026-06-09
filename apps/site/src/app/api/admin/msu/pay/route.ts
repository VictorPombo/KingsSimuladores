import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { sendEmailMessage } from '@kings/notifications'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (admin.error) return admin.error

    const { payoutId } = await req.json()
    if (!payoutId) {
      return NextResponse.json({ error: 'Faltam parâmetros (payoutId)' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // Buscar dados do payout ANTES de atualizar (para o email)
    const { data: payoutData } = await supabaseAdmin
      .from('payouts')
      .select('seller_id, net_amount, order_item:order_items(product:products(title))')
      .eq('id', payoutId)
      .eq('status', 'available')
      .single()

    if (!payoutData) {
      return NextResponse.json({ error: 'Repasse não encontrado ou já foi pago.' }, { status: 404 })
    }

    // Executar o UPDATE para Pago
    const { error } = await supabaseAdmin
      .from('payouts')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payoutId)
      .eq('status', 'available')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Email de pagamento realizado ao vendedor
    try {
      if (payoutData.seller_id) {
        const { data: sellerProfile } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('id', payoutData.seller_id)
          .single()

        if (sellerProfile?.email) {
          const productTitle = (payoutData.order_item as any)?.product?.title || 'seu equipamento'
          const netAmount = payoutData.net_amount || 0

          await sendEmailMessage({
            to: sellerProfile.email,
            subject: '💰 Pagamento efetuado! Confira sua conta.',
            html: `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 30px;">
    <div style="font-size: 40px; margin-bottom: 10px;">💰</div>
    <h1 style="color: #fff; margin-bottom: 20px;">Pagamento Efetuado!</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      <strong>${sellerProfile.full_name?.split(' ')[0] || 'Piloto'}</strong>, o repasse referente à venda do <strong>${productTitle}</strong> foi efetuado pela equipe Kings.
    </p>
    <div style="background: rgba(139, 92, 246, 0.08); border: 1px dashed rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #71717a; font-size: 14px;">Valor transferido:</p>
      <h2 style="margin: 5px 0 0 0; color: #8b5cf6; font-size: 28px;">R$ ${netAmount.toFixed(2).replace('.', ',')}</h2>
      <p style="margin: 8px 0 0 0; color: #71717a; font-size: 12px;">Verifique em sua conta bancária cadastrada.</p>
    </div>
    <p style="color: #71717a; font-size: 14px; margin-bottom: 30px;">
      Obrigado por vender na plataforma! Está com outro equipamento parado? Anuncie agora mesmo.
    </p>
    <a href="${process.env.NEXT_PUBLIC_URL_MSU || 'https://kingssimuladores.com.br/usado'}/vender" style="display: inline-block; background-color: #8b5cf6; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Anunciar Novo Equipamento
    </a>
  </div>
</div>`
          })
          console.log(`[Admin Pay] Email de pagamento enviado para ${sellerProfile.email}`)
        }
      }
    } catch (emailErr) {
      console.error('[Admin Pay] Falha ao enviar email de pagamento:', emailErr)
    }

    return NextResponse.json({ success: true, newStatus: 'paid' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
