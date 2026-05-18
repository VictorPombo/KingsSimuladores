import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'ID do pedido obrigatório' }, { status: 400 })
    }

    // Valida se o usuário que chamou é Admin
    const supabaseUser = await createServerSupabaseClient()
    const { data: userData, error: authError } = await (supabaseUser.auth as any).getUser()
    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('auth_id', userData.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado: apenas administradores podem excluir pedidos' }, { status: 403 })
    }

    // Executa a deleção com Admin Client para bypass de RLS
    const adminSupabase = createAdminClient()
    
    // Deleta os vínculos (Foreign Keys) antes de deletar o pedido para não dar erro
    await adminSupabase.from('invoices').delete().eq('order_id', orderId)
    await adminSupabase.from('marketplace_orders').delete().eq('order_id', orderId)
    
    // Deleta os itens do pedido (se o banco não tiver cascade)
    await adminSupabase.from('order_items').delete().eq('order_id', orderId)
    
    // Deleta o pedido
    const { error } = await adminSupabase.from('orders').delete().eq('id', orderId)
    
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Erro ao deletar pedido:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
