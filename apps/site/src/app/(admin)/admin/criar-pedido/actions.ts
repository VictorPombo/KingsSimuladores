'use server'

import { createAdminClient } from '@kings/db'
import { redirect } from 'next/navigation'

export async function searchProducts(query: string) {
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
  const supabase = createAdminClient()

  // Validações básicas
  if (!formData.email || !formData.name) return { error: 'Dados do cliente obrigatórios.' }
  if (formData.items.length === 0) return { error: 'Adicione pelo menos um produto.' }

  let customerId = formData.customerId
  let generatedPassword = null

  // Criar cliente novo se necessário
  if (formData.customerType === 'new') {
    generatedPassword = 'kings123'
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

    // A trigger no banco cria um profile automaticamente, então só precisamos fazer o update
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

  // Calcular totais
  const subtotal = formData.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0)
  const total = subtotal + formData.shippingCost - formData.discount

  // Tratar cupom
  let couponId = null;
  if (formData.couponCode) {
    const { data: coupon } = await supabase.from('coupons').select('id, usage_count').eq('code', formData.couponCode).single()
    if (coupon) {
      couponId = coupon.id;
      await supabase.from('coupons').update({ usage_count: coupon.usage_count + 1 }).eq('id', coupon.id)
    }
  }

  // Criar pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      brand_origin: 'kings',
      order_type: 'direct',
      status: 'pending',
      subtotal,
      shipping_cost: formData.shippingCost,
      discount: formData.discount,
      total,
      payment_method: formData.generatePaymentLink ? 'link' : 'manual',
      shipping_address: formData.address,
      notes: formData.notes || null,
      coupon_id: couponId,
    })
    .select('id')
    .single()

  if (orderError) return { error: 'Erro ao criar pedido: ' + orderError.message }

  // Inserir itens
  const orderItems = formData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: 'Erro ao adicionar itens: ' + itemsError.message }

  // Atualizar estoque
  for (const item of formData.items) {
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.productId).single()
    if (product) {
      await supabase.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.productId)
    }
  }

  // Pedido manual (sem link de pagamento) → marcar como pago e enfileirar jobs
  if (!formData.generatePaymentLink) {
    await supabase.from('orders').update({ status: 'paid' }).eq('id', order.id)

    // Buscar itens completos com dados do produto para o payload dos jobs
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

    const jobsToEnqueue = [
      'olist_erp',
      'notify_customer_whatsapp',
      'notify_customer_email',
      'notify_admin_email',
    ]

    await supabase.from('order_jobs').insert(
      jobsToEnqueue.map(job_type => ({
        order_id: order.id,
        job_type,
        payload: sharedPayload,
      }))
    )
  }

  return { orderId: order.id, generatedPassword }
}
