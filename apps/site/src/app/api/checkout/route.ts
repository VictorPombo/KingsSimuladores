import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@kings/db/server'
import { createPreference } from '@kings/payments'
import { sendEmailMessage } from '@kings/notifications'
import { createRateLimiter } from '@/lib/rate-limit'

const checkoutLimiter = createRateLimiter({ windowMs: 60_000, max: 5, message: 'Muitas tentativas de checkout. Aguarde 1 minuto.' })

export async function POST(req: Request) {
  try {
    // Rate limiting — máximo 5 checkouts por minuto por IP
    const rateLimited = checkoutLimiter.check(req)
    if (rateLimited) return rateLimited

    const body = await req.json()
    const { items, customer, address, shipping, total, coupon_id, pix_discount } = body

    // 1. Identify user — supports both logged-in and guest checkout
    const supabase = await createServerSupabaseClient()
    const adminSupabase = createAdminClient()
    const { data: { user } } = await (supabase.auth as any).getUser()

    let profileId: string

    if (user) {
      // Logged-in user: use their existing profile
      const { data: profile } = await supabase.from('profiles').select('id, addresses').eq('auth_id', user.id).single()

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
      }

      profileId = profile.id

      // Update profile with latest customer data
      const updateData: any = {}
      if (customer?.telefone) updateData.phone = customer.telefone
      if (customer?.cpf) updateData.cpf_cnpj = customer.cpf
      if (customer?.nome) updateData.full_name = customer.nome

      // Save address to profile if new
      if (address && address.cep) {
        const currentAddresses = Array.isArray(profile.addresses) ? profile.addresses : []
        const addressExists = currentAddresses.some((a: any) => a.zip_code === address.cep && a.number === address.numero)
        
        if (!addressExists) {
          updateData.addresses = [
            ...currentAddresses,
            {
              id: crypto.randomUUID(),
              is_default: currentAddresses.length === 0,
              zip_code: address.cep,
              street: address.logradouro,
              number: address.numero,
              neighborhood: address.bairro,
              city: address.cidade,
              complement: address.complemento,
              reference: address.referencia,
              created_at: new Date().toISOString()
            }
          ]
        }
      }

      if (Object.keys(updateData).length > 0) {
        await adminSupabase.from('profiles').update(updateData).eq('id', profileId)
      }

    } else {
      // Guest checkout: create or reuse a guest profile by email
      if (!customer?.email || !customer?.nome) {
        return NextResponse.json({ error: 'Nome e e-mail são obrigatórios para compras como convidado.' }, { status: 400 })
      }

      // Check if a guest profile with this email already exists
      const { data: existingProfile, error: profileErr } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', customer.email.toLowerCase().trim())
        .limit(1)
        .maybeSingle()

      if (profileErr) {
        console.error('[Checkout] Falha ao verificar perfil existente:', profileErr)
        const maskedCpf = customer?.cpf ? customer.cpf.replace(/\d(?=\d{4})/g, '*') : 'N/A'
        await adminSupabase.from('failed_checkouts').insert({
          customer_email: customer?.email,
          customer_phone: customer?.telefone,
          customer_cpf_masked: maskedCpf,
          error_message: 'Erro ao verificar perfil existente (Possível duplicata de email guest)',
          error_details: profileErr,
          cart_total: total
        })
        return NextResponse.json({ error: 'Erro de segurança ao verificar seu e-mail. Tente fazer login ou usar outro e-mail.' }, { status: 500 })
      }

      if (existingProfile) {
        profileId = existingProfile.id
        // Update with latest info
        await adminSupabase.from('profiles').update({
          full_name: customer.nome,
          cpf_cnpj: customer.cpf,
          phone: customer.telefone,
        }).eq('id', profileId)
      } else {
        // Create new guest profile
        const newProfileId = crypto.randomUUID()
        const guestAddress = address && address.cep ? [{
          id: crypto.randomUUID(),
          is_default: true,
          zip_code: address.cep,
          street: address.logradouro,
          number: address.numero,
          neighborhood: address.bairro,
          city: address.cidade,
          complement: address.complemento,
          reference: address.referencia,
          created_at: new Date().toISOString()
        }] : []

        const { error: insertErr } = await adminSupabase.from('profiles').insert({
          id: newProfileId,
          full_name: customer.nome,
          email: customer.email.toLowerCase().trim(),
          cpf_cnpj: customer.cpf,
          phone: customer.telefone,
          role: 'customer',
          addresses: guestAddress,
        })

        if (insertErr) {
          console.error('[Checkout] Failed to create guest profile:', insertErr)
          return NextResponse.json({ error: 'Falha ao registrar dados do cliente.' }, { status: 500 })
        }

        profileId = newProfileId
      }
    }

    // 2. Validate input minimally
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }

    if (!customer?.cpf || customer.cpf.replace(/\D/g, '').length < 11) {
      return NextResponse.json({ error: 'CPF é obrigatório e deve ser válido para a emissão da Nota Fiscal.' }, { status: 400 })
    }

    if (!customer?.telefone || customer.telefone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Telefone/WhatsApp é obrigatório para contato logístico.' }, { status: 400 })
    }

    // Permite itens misturados livremente. A lógica define o storeContext com base no primeiro item.
    const firstStore = items[0].storeOrigin || 'kings'

    const storeContext = firstStore === 'seven' ? 'seven' : (firstStore === 'msu' ? 'msu' : 'kings')

    // 3. Native Order Creation in Database FIRST to get an ID
    const orderData = {
      customer_id: profileId,
      brand_origin: storeContext,
      order_type: 'direct',
      status: 'pending',
      subtotal: total - (shipping ? parseFloat(shipping.price) : 0),
      shipping_cost: shipping ? parseFloat(shipping.price) : 0,
      total: total,
      shipping_address: address,
      preference_id: null,
      coupon_id: coupon_id || null,
      notes: shipping?.name ? `Frete: ${shipping.name}` : null,
    }

    const { data: newOrder, error: orderErr } = await adminSupabase
      .from('orders')
      .insert(orderData as any)
      .select('id')
      .single()

    if (orderErr || !newOrder) {
      console.error('Insert Order Error:', orderErr)
      return NextResponse.json({ error: 'Database failed to create order' }, { status: 500 })
    }

    // Para MSU: calcular a taxa Kings antecipadamente para passar ao MP como marketplace_fee
    let msuMarketplaceFee: number | undefined
    if (storeContext === 'msu') {
      const { data: brand } = await adminSupabase.from('brands').select('settings').eq('name', 'msu').single()
      const commissionRate = brand?.settings?.commission_rate !== undefined ? Number(brand.settings.commission_rate) : 15
      const itemsTotal = items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0)
      msuMarketplaceFee = Math.round((itemsTotal * commissionRate) / 100 * 100) / 100
    }

    let preference: any;
    try {
      preference = await createPreference(items, customer, newOrder.id, msuMarketplaceFee, storeContext, orderData.shipping_cost, !!pix_discount)
    } catch (prefErr: any) {
      console.error('[Checkout] Falha ao gerar preferência no Mercado Pago:', prefErr)
      const maskedCpf = customer?.cpf ? customer.cpf.replace(/\d(?=\d{4})/g, '*') : 'N/A'
      await adminSupabase.from('failed_checkouts').insert({
        customer_email: customer?.email,
        customer_phone: customer?.telefone,
        customer_cpf_masked: maskedCpf,
        error_message: 'Mercado Pago rejeitou dados do cliente (Ex: CPF/Telefone mal formatado)',
        error_details: { message: prefErr?.message },
        cart_total: total
      })
      return NextResponse.json({ error: 'Dados de pagamento rejeitados. Verifique se o CPF e Telefone estão corretos e tente novamente.' }, { status: 400 })
    }

    // 4.5. Update Order with Preference ID
    if (preference?.id) {
       await adminSupabase.from('orders').update({ preference_id: preference.id }).eq('id', newOrder.id)
    }

    // 5. Insert Order Items natively
    const orderItemsData = items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      store_origin: item.storeOrigin || 'kings',
    }))

    const { error: itemsErr } = await adminSupabase
      .from('order_items')
      .insert(orderItemsData as any)

    if (itemsErr) {
      console.error('Insert Items Error:', itemsErr)
      // Ideally we would rollback the order here or it would be in an RPC transaction
    }

    // 6. MSU Marketplace Segregation (Escrow Model)
    if (storeContext === 'msu') {
      const { data: brand } = await adminSupabase.from('brands').select('settings').eq('name', 'msu').single()
      // Fallback para 15% conforme regra de negócio oficial, se não houver na tabela
      let commissionRate = 15; 
      if (brand?.settings?.commission_rate !== undefined) {
        commissionRate = Number(brand.settings.commission_rate);
      }

      for (const item of items) {
        // Obter seller_id do produto anunciado
        const { data: listing } = await adminSupabase.from('marketplace_listings').select('seller_id').eq('id', item.id).single()
        
        if (listing?.seller_id) {
          const itemTotal = item.price * item.quantity
          const kingsFee = (itemTotal * commissionRate) / 100
          const sellerNet = itemTotal - kingsFee

          await adminSupabase.from('marketplace_orders').insert({
            buyer_id: profileId,
            seller_id: listing.seller_id,
            listing_id: item.id,
            total_price: itemTotal,
            commission_rate: commissionRate,
            kings_fee: kingsFee,
            seller_net: sellerNet,
            status: 'awaiting_payment',
            mp_preference_id: preference.id, // Vínculo principal para o webhook antigo (caso falhe o order_id)
            order_id: newOrder.id // Novo vínculo estrutural criado na migration 010
          })
        }
      }
    }

    // 7. Enviar notificação por e-mail para o administrador (Agora SEGURO: após inserção dos itens)
    try {
      const itemsListHtml = items.map((i: any) => `<li>${i.quantity}x ${i.title || 'Item'} - R$ ${Number(i.price).toFixed(2)}</li>`).join('')
      await sendEmailMessage({
        to: 'contato@kingssimuladores.com.br',
        subject: `Novo Pedido Iniciado - ${customer?.nome || 'Cliente'}`,
        html: `
          <div style="font-family: sans-serif; color: #111;">
            <h2>Um novo pedido foi iniciado na Kings!</h2>
            <p><strong>Cliente:</strong> ${customer?.nome || 'Não informado'} (${customer?.email || 'Sem e-mail'} / ${customer?.telefone || 'Sem telefone'})</p>
            <p><strong>ID do Pedido:</strong> ${newOrder.id}</p>
            <p><strong>Valor Total:</strong> R$ ${Number(total).toFixed(2)}</p>
            <h3>Itens do Pedido:</h3>
            <ul>
              ${itemsListHtml}
            </ul>
            <p><strong>Status:</strong> Aguardando Pagamento (Mercado Pago)</p>
          </div>
        `
      })
    } catch (emailErr) {
      console.error('[Notificação] Falha ao enviar email do novo pedido:', emailErr)
    }

    // Return the real session/order
    return NextResponse.json({
      ok: true,
      orderId: newOrder.id,
      preferenceId: preference.id,
      init_point: preference.init_point,
      detail: 'Order recorded natively in DB and preference generated'
    })

  } catch (err: any) {
    console.error('🚨 [CRITICAL CHECKOUT ERROR] 🚨 Falha na rota de checkout:', {
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      name: err?.name,
      err_object: err
    });
    return NextResponse.json({ error: err?.message || 'Erro interno no checkout' }, { status: 500 })
  }
}
