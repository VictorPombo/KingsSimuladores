import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { createServerSupabaseClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { payoutId } = await req.json()
    if (!payoutId) {
      return NextResponse.json({ error: 'Faltam parâmetros (payoutId)' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = createAdminClient()

    // 1. Validar Sessão
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Checagem de privilégios de Admin
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('auth_id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
       return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem dar baixa financeira.' }, { status: 403 })
    }

    // 3. Executar o UPDATE para Pago
    const { error } = await supabaseAdmin
      .from('payouts')
      .update({ status: 'paid' })
      .eq('id', payoutId)
      .eq('status', 'available') // Medida de segurança, só paga o que já está disponível

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, newStatus: 'paid' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
