import { NextResponse } from 'next/server'
import { verifyPaymentStatus } from '@kings/payments'
import { pushOrderToOlist } from '@kings/payments'
import { sendWhatsappMessage } from '@kings/notifications'
import { sendEmailMessage } from '@kings/notifications'
import { generateShippingLabel } from '@kings/shipping'
import { createServerSupabaseClient } from '@kings/db/server'
import { createAdminClient } from '@kings/db'

export async function POST(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams
    const topic = searchParams.get('topic') || searchParams.get('type')
    const body = await req.json()
    
    const action = body.action || topic

    // We only care about explicit payment update hits
    if (action === 'payment.created' || action === 'payment.updated' || topic === 'payment') {
      const paymentId = body.data?.id || searchParams.get('data.id')

      if (!paymentId) return NextResponse.json({ ok: true }) // ignoring without ID
      
      // 1. Double-Check com o Mercado Pago usando nosso pacote seguro
      const storeContext = searchParams.get('store') || undefined
      const paymentData = await verifyPaymentStatus(paymentId, storeContext)
      
      if (paymentData.status === 'approved' && paymentData.external_reference) {
        const orderId = paymentData.external_reference
        
        // Usamos o Admin Client (Service Role) pois recebemos a requisição de fora da sessão do cliente
        const supabase = createAdminClient()
        
        // 1.5 Proteção contra Webhook Duplicado
        const { data: existingOrder } = await supabase.from('orders').select('status').eq('id', orderId).single()
        if (existingOrder?.status === 'paid') {
           console.log(`[Webhook MP] Pedido ${orderId} já processado anteriormente. Ignorando webhook duplicado.`)
           return NextResponse.json({ received: true })
        }
        
        // 2. Atualizar o Status do Pedido
        const { data: order, error: orderErr } = await supabase
          .from('orders')
          .update({ status: 'paid', payment_id: paymentId, payment_method: paymentData.payment_method_id })
          .eq('id', orderId)
          .select('id, customer_id, brand_origin, total, shipping_address, coupon_id, profiles(full_name, email, phone)')
          .single()

        if (orderErr || !order) {
          console.error('[Webhook MP] Erro ao registrar pagamento na Order:', orderId)
          return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // 2.5 Incrementar count de uso do cupom se existir
        if (order.coupon_id) {
          const { data: couponToUpdate } = await supabase.from('coupons').select('usage_count').eq('id', order.coupon_id).single()
          if (couponToUpdate) {
            await supabase.from('coupons').update({ usage_count: (couponToUpdate.usage_count || 0) + 1 }).eq('id', order.coupon_id)
          }
        }

        // 3. Buscar os itens do pedido para Controle de Estoque
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, stock_quantity)')
          .eq('order_id', orderId)
          
        if (items) {
          for (const item of items) {
            const origin = item.store_origin || order.brand_origin
            // Em caso de Kings ou Seven (produtos nativos)
            if ((origin === 'kings' || origin === 'seven') && item.product_id) {
              const product = item.product as any
              if (product && typeof product.stock_quantity === 'number') {
                  const newStock = Math.max(0, product.stock_quantity - item.quantity)
                  await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.product_id)
              } else {
                 // fallback if relationship failed
                 const { data: p } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single()
                 if (p) {
                   const newStock = Math.max(0, p.stock_quantity - item.quantity)
                   await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.product_id)
                 }
              }
            }
            
            // Em caso de Meu Simulador Usado (MSU), marcamos como vendido
            if (origin === 'msu' && item.product_id) {
               await supabase.from('marketplace_listings').update({ status: 'sold' }).eq('id', item.product_id)
            }
          }
        }
        
        // 3.5 Limpar a tabela de Carrinho Ativo do cliente agora que foi Pago (Isso impede que o Robô de Cart Abandonado atue em falsos positivos)
        if (order.customer_id) {
          await supabase.from('cart').delete().eq('customer_id', order.customer_id)
        }

        console.log(`[Webhook MP] Sucesso! Pedido ${orderId} aprovado e estoque atualizado.`)
        
        // 4. Injeção no Olist ERP Fatiada (Emissão de NF-e e Baixa de Estoque Multi-loja)
        const profilesData = order.profiles as any
        const profile = Array.isArray(profilesData) ? profilesData[0] : profilesData

        let nfeResFirst: any = null; // Guardar a primeira NFe gerada para usar no WhatsApp como referência (se quiser)

        // Agrupar itens por loja
        const storeGroups: Record<string, any[]> = {}
        if (items) {
          items.forEach(item => {
            const origin = item.store_origin || order.brand_origin || 'kings'
            if (!storeGroups[origin]) storeGroups[origin] = []
            storeGroups[origin].push(item)
          })
        } else {
          // fallback
          storeGroups[order.brand_origin || 'kings'] = []
        }

        const adminSupabase = createAdminClient()

        // Para cada loja, montar o payload e disparar para o ERP
        for (const store of Object.keys(storeGroups)) {
          const storeItems = storeGroups[store]
          // Calcula subtotal dos itens dessa loja
          const storeSubtotal = storeItems.reduce((acc, curr) => acc + (curr.total_price || (curr.unit_price * curr.quantity) || 0), 0)
          
          // RATEIO DE FRETE: Simplificado - joga o frete para a loja principal do pedido se houver, ou divide
          // Como não temos regra contábil exata aqui, vamos colocar o frete total na primeira iteração (na loja matriz do pedido)
          const isMainStore = store === order.brand_origin
          const shippingVal = isMainStore ? order.shipping_cost : 0
          
          const orderPayload = {
            id: `${order.id}-${store}`, // Sufixo para evitar duplicação no ERP se não suportar o mesmo ID
            total: storeSubtotal + (shippingVal || 0),
            customer: {
              name: profile?.full_name,
              email: profile?.email
            },
            shipping: order.shipping_address,
            items: storeItems.map(i => ({
               product_id: i.product_id,
               title: i.product?.title || 'Produto Genérico',
               quantity: i.quantity,
               unit_price: i.unit_price
            }))
          }

          if (store === 'seven') {
            void pushOrderToOlist(orderPayload, store)
              .then(async (res) => {
                if (res && res.status !== 'error') {
                  await adminSupabase.from('invoices').insert({
                    order_id: order.id,
                    store_origin: store,
                    erp_id: res.tiny_id || res.id || '',
                    cnpj_emitente: res.cnpj_emitente || '',
                    nfe_number: res.nfe_number || '',
                    nfe_key: res.nfe_key || '',
                    status: res.status,
                    xml_url: res.xml_url || '',
                    pdf_url: res.pdf_url || ''
                  })
                  if (res.tiny_id) await adminSupabase.from('orders').update({ erp_id: res.tiny_id }).eq('id', order.id)
                  console.log(`[Webhook MP] NF-e do Pedido ${orderId} (Seven) enfileirada assincronamente.`)
                }
              })
              .catch(err => console.error('[Olist Async Error]', err))
          } else {
            // Kings ou MSU mantêm síncrono
            const res = await pushOrderToOlist(orderPayload, store)
            if (res && res.status !== 'error') {
               if (!nfeResFirst) nfeResFirst = res; // salva o link pra usar no wpp
               await adminSupabase.from('invoices').insert({
                order_id: order.id,
                store_origin: store,
                erp_id: res.tiny_id || res.id || '',
                cnpj_emitente: res.cnpj_emitente || '',
                nfe_number: res.nfe_number || '',
                nfe_key: res.nfe_key || '',
                status: res.status,
                xml_url: res.xml_url || '',
                pdf_url: res.pdf_url || ''
              })
              console.log(`[Webhook MP] NF-e do Pedido ${orderId} (${store}) salva no banco.`)
            }
          }
        }
        
        let nfeRes = nfeResFirst; // mock compatibility for the rest of the file
        
        // 5. Notificação via Chatwoot (WhatsApp)
        const clienteNome = profile?.full_name?.split(' ')[0] || 'Cliente'
        const clientePhone = profile?.phone
        
        if (clientePhone) {
          let wppText = `🏎️ Fala *${clienteNome}*, tudo acelerando por aí?\n\nPassando para confirmar que o pagamento do seu pedido (*#${orderId.split('-')[0]}*) foi aprovado com sucesso! ✅\n\n`
          if (nfeRes?.pdf_url) {
            wppText += `Aqui está a sua Nota Fiscal Eletrônica:\n📄 ${nfeRes.pdf_url}\n\n`
          }
          wppText += `Entraremos em contato novamente assim que sua encomenda for despachada. Grande abraço da equipe KingsHub!`
          
          await sendWhatsappMessage({
            phone: clientePhone,
            message: wppText
          })
        }

        // 6. Notificação via Email (Resend)
        const clienteEmail = profile?.email
        if (clienteEmail) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #00e5ff; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">Pagamento Confirmado!</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px;">Fala <strong>${clienteNome}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">O pagamento do seu pedido <strong>#${orderId.split('-')[0]}</strong> foi recebido e processado com sucesso na nossa base.</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #f7f9fa; border-radius: 6px;">
                  <h3 style="margin-top: 0; color: #111;">Sua Fatura e Documentação</h3>
                  <p style="margin-bottom: 20px; font-size: 14px; color: #555;">Já finalizamos a papelada. Você pode baixar seu recibo e NF eletrônica clicando no botão abaixo:</p>
                  <a href="${nfeRes.pdf_url}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Acessar Nota Fiscal Eletrônica</a>
                </div>

                <p style="font-size: 15px; color: #666;">Fique tranquilo, enviaremos outro aviso digital quando a transportadora embalar o seu pacote.</p>
                <br>
                <p style="font-size: 15px; margin-bottom: 0;"><strong>Aperte os cintos,</strong></p>
                <p style="font-size: 14px; margin-top: 5px; color: #00e5ff; font-weight: bold;">Equipe KingsHub</p>
              </div>
            </div>
          `
          
          await sendEmailMessage({
            to: clienteEmail,
            subject: `NF Emitida e Pagamento Confirmado - Pedido #${orderId.split('-')[0]}`,
            html: emailHtml
          })
        }
        
        // 7. Integração Logística: Gerar Etiqueta (Frenet)
        const labelResult = await generateShippingLabel(order, items || [])
        
        if (labelResult.success && labelResult.tracking_code) {
          // Salva o link da Etiqueta Térmica na coluna de tracking
          await supabase.from('orders').update({
            tracking_code: labelResult.tracking_code
          }).eq('id', orderId)
          
          console.log(`[Webhook MP] Etiqueta Logística vinculada ao Pedido ${orderId}`)
        }

        // 8. Integração Contábil: Split Payment MSU (Comissões)
        if (order.brand_origin === 'msu' && items && items.length > 0) {
          console.log(`[Webhook MP] Calculando Sub-Ledger (Split Payment) para Pedido MSU ${orderId}`)
          
          for (const item of items) {
             if (item.product_id) {
                // Buscamos o Listing original para capturar o Seller ID e o Preço Base Real (Prevenindo spoofing de price no carrinho)
                const { data: listing } = await supabase
                  .from('marketplace_listings')
                  .select('seller_id, price')
                  .eq('id', item.product_id)
                  .single()

                if (listing && listing.seller_id) {
                   // Matemática do Split: 10% de corretagem para KingsHub
                   const saleAmount = listing.price * item.quantity
                   const commissionRate = 0.10 // 10%
                   const commissionAmount = saleAmount * commissionRate
                   const sellerPayout = saleAmount - commissionAmount
                   
                   await supabase.from('commissions').insert({
                     order_id: orderId,
                     seller_id: listing.seller_id,
                     sale_amount: saleAmount,
                     commission_rate: commissionRate,
                     commission_amount: commissionAmount,
                     seller_payout: sellerPayout,
                     payout_status: 'pending' // Fica aguardando liberação formal/passagem dos 7 dias
                   })
                   console.log(`[Webhook MP] ✅ Split Contábil - MSU -> Vendedor Retém: R$${sellerPayout.toFixed(2)} | KingsHub Retém: R$${commissionAmount.toFixed(2)}.`)
                }
             }
          }
        }
      }
    }

    // MP exige retorno HTTP 200 rápido para todas as comunicações 
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook MP Fatal]', error)
    // Se der 500, o MP tentará enviar denovo, então capturamos
    return NextResponse.json({ error: 'Processing error', details: error.message }, { status: 500 })
  }
}
