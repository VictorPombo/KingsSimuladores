import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { tracking_code } = await req.json()
    
    if (!tracking_code?.trim()) {
      return NextResponse.json({ error: 'Código de rastreio vazio' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Opcional: verificar se o usuário é o dono do listing deste pedido
    const { error } = await supabase
      .from('orders')
      .update({ tracking_code: tracking_code.trim(), status: 'shipped' })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
