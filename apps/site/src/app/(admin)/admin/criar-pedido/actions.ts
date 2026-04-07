'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'

export async function searchProducts(query: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('id, title, sku, price, stock, images, status')
    .eq('status', 'active')
    .ilike('title', `%${query}%`)
    .limit(10)
  return data || []
}

export async function searchClients(query: string) {
  const supabase = await createServerSupabaseClient()
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
}) {
  const supabase = await createServerSupabaseClient()

  // Validações básicas
  if (!formData.email || !formData.name) throw new Error('Dados do cliente obrigatórios.')
  if (formData.items.length === 0) throw new Error('Adicione pelo menos um produto.')

  let customerId = formData.customerId

  // Criar cliente novo se necessário
  if (formData.customerType === 'new') {
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email: formData.email,
        full_name: formData.name,
        cpf_cnpj: formData.cpfCnpj,
        phone: formData.phone,
        role: 'client',
        addresses: [formData.address],
      })
      .select('id')
      .single()

    if (profileError) throw new Error('Erro ao criar cliente: ' + profileError.message)
    customerId = newProfile.id
  }

  if (!customerId) throw new Error('Cliente não selecionado.')

  // Calcular totais
  const subtotal = formData.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0)
  const total = subtotal + formData.shippingCost - formData.discount

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
    })
    .select('id')
    .single()

  if (orderError) throw new Error('Erro ao criar pedido: ' + orderError.message)

  // Inserir itens
  const orderItems = formData.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.unitPrice * item.quantity,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw new Error('Erro ao adicionar itens: ' + itemsError.message)

  // Atualizar estoque
  for (const item of formData.items) {
    const { data: product } = await supabase.from('products').select('stock').eq('id', item.productId).single()
    if (product) {
      await supabase.from('products').update({ stock: Math.max(0, product.stock - item.quantity) }).eq('id', item.productId)
    }
  }

  return { orderId: order.id }
}
