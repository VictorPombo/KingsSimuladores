import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'

export async function POST(req: Request) {
  try {
    const { product_id, name, phone } = await req.json()

    if (!product_id || !name || !phone) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Higienizar telefone
    let cleanPhone = phone.replace(/\D/g, '')
    // Se a pessoa digitou apenas o numero normal com DDD (11 dígitos, ex: 11999999999)
    // adicionamos o 55.
    if (cleanPhone.length === 11 || cleanPhone.length === 10) {
      cleanPhone = `55${cleanPhone}`
    } else if (cleanPhone.length > 13) {
      // talvez já tenha um 55
      if (!cleanPhone.startsWith('55')) {
         cleanPhone = `55${cleanPhone}`
      }
    }

    const supabase = await createServerSupabaseClient()

    // Verifica se já existe o mesmo phone na espera para este produto (pra não duplicar)
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('product_id', product_id)
      .eq('customer_phone', cleanPhone)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      // Se já tá na lista, não precisa dar erro, apenas retorna sucesso.
      return NextResponse.json({ success: true, message: 'Já está na lista' })
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({
        product_id,
        customer_name: name,
        customer_phone: cleanPhone,
        status: 'pending'
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Notify Stock Error:', err)
    return NextResponse.json({ error: 'Ocorreu um erro ao salvar o registro' }, { status: 500 })
  }
}
