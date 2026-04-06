import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

// Mocks para integrações terceiras (NFe e Resend Email)
async function emitNFeMock(orderData: any) {
  console.log(`[NF-e Mock] Emitindo nota fiscal para pedido ${orderData.id}...`)
  // Simulação de emissão
  return { nfeId: 'mock-nfe-123', status: 'issued' }
}

async function sendEmailMock(to: string, subject: string, content: string) {
  console.log(`[Email Mock] Enviando e-mail para ${to} - Tema: ${subject}`)
  return true
}

export async function POST(req: Request) {
  try {
    // Para produção: Validar WEBHOOK SECRET x-signature aqui.
    // Ex: const signature = req.headers.get('x-signature')
    
    // Ler os dados
    const body: any = await req.json()

    // O Mercado Pago manda notificações de payment.updated ou payment.created
    if (body.action === 'payment.updated' || body.type === 'payment') {
      const paymentId = body.data?.id
      
      if (!paymentId) return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })

      console.log(`[Webhook MP] Pagamento atualizado/criado: ${paymentId}`)

      // Lógica de mock de verificação: faria uma busca real via SDK do MP
      // const mpPayment = await new mercadopago.Payment({ accessToken }).get({ id: paymentId })
      const statusPagmento = 'approved' // MOCK SEMPRE APROVADO PARA DESENVOLVIMENTO
      const externalReference = body.data?.external_reference || 'mock-order-id-from-webhook'

      if (statusPagmento === 'approved') {
        const supabase = createAdminClient()

        // 1. Atualizar Pedido no Supabase
        const { data: order, error } = await (supabase.from('orders') as any)
          .update({ status: 'paid' })
          .eq('payment_id', paymentId) // ou eq('id', externalReference) se salvarmos no external ref
          .select('*, profiles(email)')
          .single()

        if (error) {
          console.error('[Webhook MP] Erro ao atualizar pedido:', error)
          // Em produção isso pode já ter sido aprovado ou pode ser só o mock não achando.
        } else if (order) {
           console.log(`[Webhook MP] Pedido ${order.id} marcado como PAGO. Stock diminuído por Trigger.`)
           
           // 2. Integração com NFe.io
           await emitNFeMock(order)

           // 3. Email com Resend
           await sendEmailMock(
             order.profiles?.email,
             'Pagamento Aprovado - Kings Simuladores',
             `Seu pedido no valor de R$${order.total} foi confirmado e logo será enviado!`
           )
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
