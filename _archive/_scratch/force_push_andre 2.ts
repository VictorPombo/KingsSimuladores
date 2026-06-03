import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { pushOrderToOlist } from './packages/payments/src/olist.js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function run() {
  const orderId = '80f9f8ab-35e7-4665-864f-2d30b8cea15a' // André

  console.log('Buscando pedido:', orderId)
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, brand_origin, status, total, shipping_address, shipping_cost, profiles(full_name, email, phone, cpf_cnpj)')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) return console.error('Erro pedido', orderErr)

  const { data: items } = await supabase
    .from('order_items')
    .select('id, product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, sku, ncm, ean)')
    .eq('order_id', orderId)

  const customerProfile = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles

  const orderPayload = {
    id: order.id,
    total: order.total,
    customer: {
      name: customerProfile?.full_name || 'Desconhecido',
      email: customerProfile?.email || '',
      cpf_cnpj: customerProfile?.cpf_cnpj || '',
      phone: customerProfile?.phone || ''
    },
    shipping: order.shipping_address || {},
    shipping_cost: order.shipping_cost || 0,
    items: items!.map((i: any) => ({
       product_id: i.product?.sku || i.product_id,
       title: i.product?.title || 'Item',
       quantity: i.quantity,
       unit_price: i.unit_price,
       ncm: i.product?.ncm || '',
       gtin: i.product?.ean || 'SEM GTIN',
       origem: '0',
       cfop: '6102'
    }))
  }

  console.log('Enviando para Olist (usando função oficial)...')
  const res = await pushOrderToOlist(orderPayload as any, 'kings', process.env.OLIST_API_KEY_KINGS)

  console.log('Res:', res)

  if (res && res.tiny_id) {
      const newErpId = res.tiny_id
      console.log('Sucesso! Novo ERP ID:', newErpId)

      await supabase.from('invoices').update({ erp_id: newErpId, pdf_url: '' }).eq('order_id', order.id)
      await supabase.from('orders').update({ erp_id: newErpId }).eq('id', order.id)
      console.log('Banco de dados atualizado!')
  } else {
      console.error('Falha ao enviar')
  }
}

run()
