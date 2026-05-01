import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch the invoice record
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found in DB' }, { status: 404 })
    }

    if (invoice.pdf_url) {
      // Already has a PDF
      return NextResponse.json({ message: 'Invoice already has PDF', pdf_url: invoice.pdf_url, status: invoice.status })
    }

    if (!invoice.erp_id || invoice.erp_id.startsWith('mock_')) {
      return NextResponse.json({ error: 'Order not injected in Tiny ERP properly or using mock' }, { status: 400 })
    }

    // O ERP ID salvo quando a API responde OK é puramente numérico (ex: "123456789")
    // Se por acaso cair no catch ou fallback (ex: tiny_UUID), não tem como consultar o pedido.obter.
    const erpIdNum = invoice.erp_id.startsWith('tiny_') ? null : invoice.erp_id

    if (!erpIdNum) {
        return NextResponse.json({ error: 'Invalid ERP ID for Tiny (not an integer)' }, { status: 400 })
    }

    const token = invoice.store_origin === 'seven' ? process.env.OLIST_API_KEY_SEVEN : (process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN)

    // 2. Fetch pedido.obter.php to get id_nota_fiscal
    const paramsObter = new URLSearchParams()
    paramsObter.append('token', token!)
    paramsObter.append('id', erpIdNum)
    paramsObter.append('formato', 'json')

    const resPedido = await fetch('https://api.tiny.com.br/api2/pedido.obter.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: paramsObter.toString()
    })

    const dataPedido = await resPedido.json()

    if (!dataPedido.retorno || dataPedido.retorno.status !== 'OK') {
        console.error('[Invoice Sync] Erro pedido.obter:', dataPedido)
        return NextResponse.json({ error: 'Failed to fetch order from Tiny' }, { status: 500 })
    }

    const idNotaFiscal = dataPedido.retorno.pedido?.id_nota_fiscal
    console.log('[API Sync] dataPedido:', JSON.stringify(dataPedido, null, 2))
    console.log('[API Sync] idNotaFiscal:', idNotaFiscal)

    if (!idNotaFiscal || idNotaFiscal === "0") {
        console.log('[API Sync] Retornando pendente porque idNotaFiscal é nulo ou 0')
        return NextResponse.json({ message: 'Nota fiscal não emitida ainda no ERP', pending: true })
    }

    // 3. Fetch nota.fiscal.obter.link.php
    const paramsLink = new URLSearchParams()
    paramsLink.append('token', token!)
    paramsLink.append('id', idNotaFiscal)
    paramsLink.append('formato', 'json')

    const resLink = await fetch('https://api.tiny.com.br/api2/nota.fiscal.obter.link.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: paramsLink.toString()
    })

    const dataLink = await resLink.json()
    console.log('[API Sync] dataLink:', JSON.stringify(dataLink, null, 2))

    if (!dataLink.retorno || dataLink.retorno.status !== 'OK') {
        console.error('[Invoice Sync] Erro obter.link:', dataLink)
        return NextResponse.json({ error: 'Failed to fetch NFe link from Tiny' }, { status: 500 })
    }

    const pdfUrl = dataLink.retorno.link_nfe
    console.log('[API Sync] pdfUrl:', pdfUrl)

    if (!pdfUrl) {
        console.log('[API Sync] Retornando pendente porque pdfUrl é vazio')
        return NextResponse.json({ message: 'Link não disponibilizado pelo ERP', pending: true })
    }

    // 4. Update DB
    console.log('[API Sync] Atualizando DB com pdfUrl:', pdfUrl)
    
    // Import and use service role client to bypass RLS, ensuring Admin and Cron jobs can update
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin.from('invoices').update({
        pdf_url: pdfUrl,
        status: 'issued'
    }).eq('id', invoice.id)

    if (updateError) {
        console.error('[API Sync] Falha ao atualizar DB:', updateError)
        return NextResponse.json({ error: 'Failed to save PDF to database' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Success', pdf_url: pdfUrl, status: 'issued' })

  } catch (err: any) {
    console.error('[Invoice Sync Error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
