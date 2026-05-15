import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const order_id = formData.get('order_id') as string | null
    
    if (!file || !order_id) {
      return NextResponse.json({ error: 'Faltam parâmetros obrigatórios' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Apenas arquivos PDF são aceitos' }, { status: 400 })
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

    const fileBuffer = await file.arrayBuffer()
    const fileName = `${order_id}_${Date.now()}.pdf`

    // Upload pro bucket invoices (que é privado)
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload do arquivo' }, { status: 500 })
    }

    // Verifica se já existe uma NFe para esse pedido
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('order_id', order_id)
      .maybeSingle()

    if (existingInvoice) {
      await supabase
        .from('invoices')
        .update({ pdf_url: fileName, status: 'issued' })
        .eq('id', existingInvoice.id)
    } else {
      await supabase
        .from('invoices')
        .insert({
          order_id,
          pdf_url: fileName,
          status: 'issued',
          store_origin: 'kings' // Fallback, não estritamente necessário mas bom preencher
        })
    }

    return NextResponse.json({ success: true, pdf_path: fileName })
  } catch (err: any) {
    console.error('Upload NFe API Error:', err)
    return NextResponse.json({ error: 'Erro interno ao processar upload' }, { status: 500 })
  }
}
