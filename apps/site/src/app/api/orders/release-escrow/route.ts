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

    console.log(`[Escrow] Pagamento ${payoutId} liberado pelo comprador ${profile.id}.`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Escrow API Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
