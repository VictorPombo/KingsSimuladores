import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { createServerSupabaseClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = createAdminClient()

    // Authentication Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin Check
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    // 1. Fetch the invoice record
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('*, order:orders(customer_id)')
      .eq('order_id', orderId)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    // Authorization Check (IDOR)
    if (!isAdmin && invoice.order?.customer_id !== user.id) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    if (invoice.pdf_url) {
      // Already has a PDF
      return NextResponse.json({ message: 'Invoice already has PDF', pdf_url: invoice.pdf_url, status: invoice.status })
    }

    if (!invoice.erp_id || invoice.erp_id.startsWith('mock_')) {
      return NextResponse.json({ error: 'Order not injected in Tiny ERP properly or using mock' }, { status: 400 })
    }

    const erpIdNum = invoice.erp_id; // Removido o bloqueio estrito que cortava o prefixo 'tiny_'

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
        console.error('[Invoice Sync] Erro pedido.obter ou pedido não encontrado:', dataPedido)
        // Se a nota ou o pedido ainda não refletiu, retornamos pendente em vez de estourar 500
        return NextResponse.json({ message: 'Pedido ainda não processado no ERP', pending: true })
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
