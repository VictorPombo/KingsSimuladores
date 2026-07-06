'use server'

import { createAdminClient, createServerSupabaseClient } from '@kings/db'
import { randomBytes } from 'crypto'

/** Valida que o caller é admin autenticado. Lança erro se não for. */
async function requireAdmin() {
  const supabaseUser = await createServerSupabaseClient()
  const { data: { user } } = await supabaseUser.auth.getUser()
  if (!user) throw new Error('Não autorizado')
  const { data: profile } = await supabaseUser.from('profiles').select('role').eq('auth_id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Acesso negado')
}

export async function searchProducts(query: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('products')
    .select('id, title, sku, price, stock, images, status, weight_kg, attributes')
    .eq('status', 'active')
    .ilike('title', `%${query}%`)
    .limit(10)
  return data || []
}

export async function searchClients(query: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, cpf_cnpj, addresses')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10)
  return data || []
}

export async function createOrder(formData: {
  customerType: 'new' | 'existing'
  customerId?: string
  email: string
  name: string
  cpfCnpj: string
  phone: string
  personType: string
  address: {
    cep: string
    receiver: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
  }
  items: { productId: string; quantity: number; unitPrice: number; title: string }[]
  shippingMethod: string
  shippingCost: number
  deliveryDays: number
  notes: string
  discount: number
  generatePaymentLink: boolean
  couponCode?: string | null
}) {
  await requireAdmin()
  const supabase = createAdminClient()

  // Validações básicas
  if (formData.items.length === 0) return { error: 'Adicione pelo menos um produto.' }

  // ─── FLUXO LINK DE PAGAMENTO ───
  // Cria apenas um cart_link com token. O pedido real nasce quando o cliente pagar via checkout.
  if (formData.generatePaymentLink) {
    // Buscar dados dos produtos para montar o payload do carrinho
    const productIds = formData.items.map(i => i.productId)
    const { data: products } = await supabase
      .from('products')
      .select('id, title, price, images, attributes')
      .in('id', productIds)

    const cartItems = formData.items.map(item => {
      const product = products?.find((p: any) => p.id === item.productId)
      return {
        id: item.productId,
        title: item.title || product?.title || 'Produto',
        price: item.unitPrice,
        quantity: item.quantity,
        imageUrl: product?.images?.[0] || '',
        brand: 'kings',
        storeOrigin: 'kings' as const,
      }
    })

    const token = randomBytes(8).toString('base64url')

    const { error: linkError } = await supabase.from('cart_links').insert({
      token,
      items: cartItems,
      coupon_code: formData.couponCode || null,
      discount: formData.discount || 0,
      customer_name: formData.name || null,
      notes: formData.notes || null,
    })

    if (linkError) return { error: 'Erro ao gerar link: ' + linkError.message }

    const baseUrl = process.env.NEXT_PUBLIC_URL_KINGS || 'https://www.kingssimuladores.com.br'
    const linkUrl = `${baseUrl}/carrinho/${token}`

    return { cartLink: linkUrl, token }
  }

  // ─── FLUXO PEDIDO MANUAL (PAGO) ───
  if (!formData.email || !formData.name) return { error: 'Dados do cliente obrigatórios.' }

  let customerId = formData.customerId
  let generatedPassword = null

  // Criar cliente novo se necessário
  if (formData.customerType === 'new') {
    generatedPassword = randomBytes(6).toString('base64url')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: generatedPassword,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('exists')) {
        return { error: 'Já existe um cliente com este e-mail. Por favor, selecione "Cliente existente".' }
      }
      return { error: 'Erro ao criar autenticação do cliente: ' + authError.message }
    }

    customerId = authData.user.id;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.name,
        cpf_cnpj: formData.cpfCnpj,
        phone: formData.phone,
        role: 'client',
        addresses: [formData.address],
      })
      .eq('auth_id', customerId);

    if (profileError) return { error: 'Erro ao atualizar perfil do cliente: ' + profileError.message }
  }

  if (!customerId) return { error: 'Cliente não selecionado.' }

  const subtotal = formData.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0)
  const total = subtotal + formData.shippingCost - formData.discount

  let couponId = null;
  if (formData.couponCode) {
    const { data: coupon } = await supabase.from('coupons').select('id, usage_count').eq('code', formData.couponCode).single()
    if (coupon) {
      couponId = coupon.id;
      await supabase.from('coupons').update({ usage_count: coupon.usage_count + 1 }).eq('id', coupon.id)
    }
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      brand_origin: 'kings',
      order_type: 'direct',
      status: 'paid',
      subtotal,
      shipping_cost: formData.shippingCost,
      discount: formData.discount,
      total,
      payment_method: 'manual',
      shipping_address: formData.address,
      notes: formData.notes || null,
      coupon_id: couponId,
    })
    .select('id')
    .single()

  if (orderError) return { error: 'Erro ao criar pedido: ' + orderError.message }

  const orderItems = formData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: 'Erro ao adicionar itens: ' + itemsError.message }

  for (const item of formData.items) {
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.productId).single()
    if (product) {
      await supabase.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.productId)
    }
  }

  // Enfileirar jobs (ERP + notificações)
  const { data: fullItems } = await supabase
    .from('order_items')
    .select('product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, sku, ncm, ean)')
    .eq('order_id', order.id)

  const sharedPayload = {
    profile: {
      full_name: formData.name,
      email: formData.email,
      cpf_cnpj: formData.cpfCnpj,
      phone: formData.phone,
    },
    order: {
      id: order.id,
      brand_origin: 'kings',
      total,
      shipping_cost: formData.shippingCost,
      shipping_address: formData.address,
    },
    items: (fullItems || []).map((i: any) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
      store_origin: i.store_origin || 'kings',
      product: i.product,
    })),
  }

  await supabase.from('order_jobs').insert(
    ['olist_erp', 'notify_customer_whatsapp', 'notify_customer_email', 'notify_admin_email'].map(job_type => ({
      order_id: order.id,
      job_type,
      payload: sharedPayload,
    }))
  )

  return { orderId: order.id, generatedPassword }
}
