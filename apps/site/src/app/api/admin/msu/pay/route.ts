import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
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
