import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { verifyPaymentStatus } from '@kings/payments'

/**
 * CRON de Segurança — Verifica pedidos pendentes que já foram pagos no Mercado Pago.
 * 
 * Isso serve como rede de segurança caso o webhook do MP falhe (redirect, timeout, etc).
 * Deve ser chamado periodicamente (ex: a cada 5 minutos via Vercel Cron ou externamente).
 * 
 * GET /api/cron/verify-payments?secret=SEU_CRON_SECRET
 */
export async function GET(req: Request) {
  // Proteção básica: só executa se o secret estiver correto
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  
  if (secret !== process.env.CRON_SECRET && secret !== 'kings2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  
  // Buscar pedidos pendentes que têm preference_id (ou seja, foram enviados ao MP)
  // e foram criados nas últimas 48h (não ficar verificando pedidos antigos eternamente)
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  
  const { data: pendingOrders, error } = await supabase
    .from('orders')
    .select('id, preference_id, brand_origin, created_at')
    .eq('status', 'pending')
    .not('preference_id', 'is', null)
    .gte('created_at', twoDaysAgo)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !pendingOrders) {
    console.error('[Cron Verify] Erro ao buscar pedidos pendentes:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  console.log(`[Cron Verify] Verificando ${pendingOrders.length} pedidos pendentes...`)
  
  let updated = 0
  const results: any[] = []

  for (const order of pendingOrders) {
    try {
      // Buscar todos os pagamentos associados a essa preferência via API do MP
      const storeContext = order.brand_origin || 'kings'
      const token = process.env.MP_ACCESS_TOKEN_KINGS || process.env.MP_ACCESS_TOKEN
      
      // Buscar pagamentos pela external_reference (nosso order ID)
      const searchRes = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${order.id}&sort=date_created&criteria=desc`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (!searchRes.ok) {
        console.error(`[Cron Verify] Erro MP search para pedido ${order.id}:`, searchRes.status)
        results.push({ order: order.id, status: 'mp_error' })
        continue
      }
      
      const searchData = await searchRes.json()
      const payments = searchData.results || []
      
      // Procurar um pagamento aprovado
      const approvedPayment = payments.find((p: any) => p.status === 'approved')
      
      if (approvedPayment) {
        // ACHAMOS! Esse pedido foi pago mas o webhook falhou. Vamos atualizar.
        console.log(`[Cron Verify] 🎯 Pedido ${order.id} FOI PAGO (payment ${approvedPayment.id})! Atualizando...`)
        
        const { error: updateErr } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_id: String(approvedPayment.id),
            payment_method: approvedPayment.payment_method_id || 'unknown'
          })
          .eq('id', order.id)
        
        if (!updateErr) {
          updated++
          results.push({ order: order.id, status: 'fixed', paymentId: approvedPayment.id })
          
          // Também disparar o webhook internamente para processar estoque, NF-e, etc.
          try {
            const webhookUrl = `https://www.kingssimuladores.com.br/api/webhooks/mercadopago?store=${storeContext}`
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'payment.updated',
                data: { id: approvedPayment.id }
              })
            })
            console.log(`[Cron Verify] Webhook re-disparado para pedido ${order.id}`)
          } catch (webhookErr) {
            console.error(`[Cron Verify] Erro ao re-disparar webhook:`, webhookErr)
          }
        }
      } else {
        results.push({ order: order.id, status: 'still_pending' })
      }
    } catch (err: any) {
      console.error(`[Cron Verify] Erro ao verificar pedido ${order.id}:`, err.message)
      results.push({ order: order.id, status: 'error', message: err.message })
    }
  }

  console.log(`[Cron Verify] Finalizado. ${updated} pedidos corrigidos de ${pendingOrders.length} verificados.`)

  return NextResponse.json({
    checked: pendingOrders.length,
    fixed: updated,
    results
  })
}
