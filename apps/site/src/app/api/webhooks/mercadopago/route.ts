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
          .select('id, customer_id, brand_origin, total, shipping_address, coupon_id, preference_id, profiles(full_name, email, phone, cpf_cnpj)')
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
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('id, product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, stock, sku, ncm, ean, seller_id, price)')
          .eq('order_id', orderId)
          
        if (itemsErr) console.error('[Webhook MP] Erro ao buscar order_items:', itemsErr);
          
        if (items) {
          for (const item of items) {
            const origin = item.store_origin || order.brand_origin
            // Em caso de Kings ou Seven (produtos nativos)
            if ((origin === 'kings' || origin === 'seven') && item.product_id) {
              const product = item.product as any
              if (product && typeof product.stock === 'number') {
                  const newStock = Math.max(0, product.stock - item.quantity)
                  await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id)
              } else {
                 // fallback if relationship failed
                 const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single()
                 if (p) {
                   const newStock = Math.max(0, p.stock - item.quantity)
                   await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id)
                 }
              }
            }
            
            // Em caso de Meu Simulador Usado (MSU), marcamos como vendido na tabela products
            if (origin === 'msu' && item.product_id) {
               await supabase.from('products').update({ status: 'sold' }).eq('id', item.product_id)
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
          const shippingVal = isMainStore ? (order as any).shipping_cost : 0
          
          const orderPayload = {
            id: `${order.id}-${store}`, // Sufixo para evitar duplicação no ERP se não suportar o mesmo ID
            total: storeSubtotal + (shippingVal || 0),
            customer: {
              name: profile?.full_name,
              email: profile?.email,
              cpf_cnpj: profile?.cpf_cnpj,
              phone: profile?.phone
            },
            shipping: order.shipping_address,
            shipping_cost: shippingVal,
            items: storeItems.map(i => {
               // Resolvemos o UF para o CFOP
               let uf = order.shipping_address?.state || '';
               if (!uf && order.shipping_address?.cidade && order.shipping_address.cidade.includes('/')) {
                 uf = order.shipping_address.cidade.split('/')[1].trim();
               }
               const cfopCalculado = (uf.toUpperCase() === 'SP') ? '5102' : '6102';

               return {
                 product_id: i.product?.sku || i.product_id, // Send SKU to ERP if available!
                 title: i.product?.title || 'Item',
                 quantity: i.quantity,
                 unit_price: i.unit_price,
                 ncm: i.product?.ncm || '',
                 gtin: i.product?.ean || 'SEM GTIN',
                 origem: '0', // 0 = Nacional
                 cfop: cfopCalculado
               };
            })
          }

          if (store === 'seven') {
            void pushOrderToOlist(orderPayload, store, store === 'seven' ? process.env.OLIST_API_KEY_SEVEN : process.env.OLIST_API_KEY_KINGS)
              .then(async (res) => {
                if (res && res.status !== 'error') {
                  await adminSupabase.from('invoices').insert({
                    order_id: order.id,
                    store_origin: store,
                    erp_id: res.tiny_id || res.id || '',
                    cnpj_emitente: '',
                    nfe_number: '',
                    nfe_key: '',
                    status: 'pending', // Deixamos como pending para o sync buscar depois
                    xml_url: '', // Vazio de forma intencional (processamento assíncrono)
                    pdf_url: ''  // Vazio de forma intencional
                  })
                  if (res.tiny_id) await adminSupabase.from('orders').update({ erp_id: res.tiny_id }).eq('id', order.id)
                  console.log(`[Webhook MP] NF-e do Pedido ${orderId} (Seven) enfileirada assincronamente (PENDING).`)
                }
              })
              .catch(err => console.error('[Olist Async Error]', err))
          } else {
            // Kings ou MSU mantêm síncrono no disparo, mas assíncrono na NFe
            console.log('============= DEBUG WEBHOOK =============')
            console.log('API KEY IN NEXTJS:', process.env.OLIST_API_KEY_KINGS)
            console.log('Store:', store)
            console.log('OrderPayload:', JSON.stringify(orderPayload, null, 2))
            
            try {
              const res = await pushOrderToOlist(orderPayload, store, store === 'seven' ? process.env.OLIST_API_KEY_SEVEN : process.env.OLIST_API_KEY_KINGS)
              if (res && res.status !== 'error') {
                 if (!nfeResFirst) nfeResFirst = res;
                 await adminSupabase.from('invoices').insert({
                  order_id: order.id,
                  store_origin: store,
                  erp_id: res.tiny_id || res.id || '',
                  cnpj_emitente: '',
                  nfe_number: '',
                  nfe_key: '',
                  status: 'pending', // Deixamos como pending
                  xml_url: '', // Vazio intencionalmente
                  pdf_url: ''  // Vazio intencionalmente
                })
                if (res.tiny_id) await adminSupabase.from('orders').update({ erp_id: res.tiny_id }).eq('id', order.id)
                console.log(`[Webhook MP] Pedido ${orderId} (${store}) salvo no banco. NFe em processamento (PENDING).`)
              }
            } catch (err) {
              console.error(`[Olist Sync Error] Falha ao injetar pedido ${orderId} na loja ${store}:`, err)
            }
          }
        }
        
        let nfeRes = nfeResFirst; // mock compatibility for the rest of the file
        
        // 5. Notificação via Chatwoot (WhatsApp)
        const clienteNome = profile?.full_name?.split(' ')[0] || 'Cliente'
        const clientePhone = profile?.phone
        
        if (clientePhone) {
          let wppText = `🏎️ Fala *${clienteNome}*, tudo acelerando por aí?\n\nPassando para confirmar que o pagamento do seu pedido (*#${orderId.split('-')[0]}*) foi aprovado com sucesso! ✅\n\n`
          wppText += `A sua Nota Fiscal Eletrônica já está em processamento e será disponibilizada no seu painel em breve.\n\n`
          wppText += `Entraremos em contato novamente assim que sua encomenda for despachada. Grande abraço da equipe KingsHub!`
          
          await sendWhatsappMessage({
            phone: clientePhone,
            message: wppText
          })
        }

        // 6. Notificação via Email (Resend)
        const clienteEmail = profile?.email
        if (clienteEmail) {
          const nfBlock = `
                <div style="margin: 30px 0; padding: 20px; background-color: #f7f9fa; border-radius: 6px;">
                  <h3 style="margin-top: 0; color: #111;">Sua Fatura e Documentação</h3>
                  <p style="margin-bottom: 20px; font-size: 14px; color: #555;">Já finalizamos a papelada. A sua Nota Fiscal Eletrônica está sendo processada neste exato momento e estará disponível para download no seu painel de usuário em breve!</p>
                </div>
          `

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #00e5ff; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">Pagamento Confirmado!</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px;">Fala <strong>${clienteNome}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">O pagamento do seu pedido <strong>#${orderId.split('-')[0]}</strong> foi recebido e processado com sucesso na nossa base.</p>
                
                ${nfBlock}

                <p style="font-size: 15px; color: #666;">Fique tranquilo, enviaremos outro aviso digital quando a transportadora embalar o seu pacote.</p>
                <br>
                <p style="font-size: 15px; margin-bottom: 0;"><strong>Aperte os cintos,</strong></p>
                <p style="font-size: 14px; margin-top: 5px; color: #00e5ff; font-weight: bold;">Equipe KingsHub</p>
              </div>
            </div>
          `
          
          await sendEmailMessage({
            to: clienteEmail,
            subject: `Pagamento Confirmado - Pedido #${orderId.split('-')[0]}`,
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

        // 8. Integração Contábil: Split Payment MSU (Comissões - Escrow Model)
        if (items && items.length > 0 && order.preference_id) {
          console.log(`[Webhook MP] Atualizando status de pagamentos MSU no Sub-Ledger para Pedido ${orderId}`)
          
          // Atualiza o status em lote para todos os itens da MSU dessa compra
          await supabase.from('marketplace_orders').update({ 
            status: 'paid',
            mp_payment_id: paymentId
          }).eq('mp_preference_id', order.preference_id)

          for (const item of items) {
             const origin = item.store_origin || order.brand_origin
             if (origin === 'msu' && item.product_id && item.product) {
                const product = item.product as any
                if (product.seller_id) {
                   try {
                     // Buscar os valores exatos retidos na hora do checkout (Kings_fee e seller_net)
                     const { data: mpOrder } = await supabase.from('marketplace_orders')
                        .select('seller_net, kings_fee')
                        .eq('listing_id', item.id)
                        .eq('mp_preference_id', order.preference_id)
                        .single()
                        
                     const sellerPayout = mpOrder?.seller_net || 0
                     
                     console.log(`[Webhook MP] ✅ Venda MSU Registrada - Item ${item.id} -> Vendedor Retém: R$${sellerPayout.toFixed(2)} | KingsHub Retém: R$${(mpOrder?.kings_fee || 0).toFixed(2)}.`)

                     // 8.5 Disparo de E-mail de Venda Realizada
                     const { data: sellerProfile } = await supabase.from('profiles').select('email, full_name').eq('id', product.seller_id).single()
                     if (sellerProfile && sellerProfile.email) {
                       const MSU_URL = process.env.NEXT_PUBLIC_URL_MSU || 'https://meusimuladorusado.com.br'
                       const html = `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(232,0,45,0.2); border-radius: 12px; padding: 30px;">
    <div style="font-size: 40px; margin-bottom: 10px;">📦</div>
    <h1 style="color: #fff; margin-bottom: 10px;">Vendido!</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6;">
      Alguém acaba de comprar o seu <strong>${product.title}</strong> no MeuSimuladorUsado! O pagamento já foi confirmado.
    </p>
    
    <div style="background-color: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #71717a; font-size: 14px;">Você vai receber:</p>
      <h2 style="margin: 5px 0 0 0; color: #22c55e; font-size: 28px;">R$ ${sellerPayout.toFixed(2).replace('.', ',')}</h2>
    </div>

    <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 30px;">
      Por favor, acesse o seu painel agora mesmo para ver os dados de endereço do comprador e combinar o envio.
    </p>
    
    <a href="${MSU_URL}/usado/dashboard" style="display: inline-block; background-color: #E8002D; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Ver Dados de Envio
    </a>
  </div>
</div>`
                       await sendEmailMessage({
                         to: sellerProfile.email,
                         subject: "Vendido! Prepare o envio do seu equipamento 📦",
                         html
                       })
                       console.log(`[Webhook MP] E-mail de venda MSU enviado para o vendedor: ${sellerProfile.email}`)
                     }
                   } catch (err) {
                     console.error(`[Webhook MP] Erro ao registrar email de venda do item ${item.id}:`, err)
                   }
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
