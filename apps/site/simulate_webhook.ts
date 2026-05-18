import { createAdminClient } from '@kings/db/server'
import { pushOrderToOlist } from '@kings/payments/src/olist'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function run() {
  const orderId = process.argv[2]
  if (!orderId) {
    console.error('Forneça o ID do pedido. Ex: npx tsx simulate_webhook.ts 57823bab-6873-45fb-acd5-0457bbd4ea22')
    return
  }

  const supabase = await createAdminClient()
  
  // 1. Get Order
  const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).single()
  if (orderErr || !order) {
    console.error('Order not found', orderErr)
    return
  }

  // 2. Get Profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', order.user_id).single()
  
  // 3. Get Items
  const { data: items } = await supabase.from('order_items').select('product_id, quantity, unit_price, total_price, store_origin, product:product_id(title, stock, sku, ncm, ean)').eq('order_id', orderId)
  if (!items || items.length === 0) {
    console.error('No items found for order')
    return
  }

  // Group by store
  const itemsByStore = items.reduce((acc: any, item: any) => {
    const store = item.store_origin || 'kings'
    if (!acc[store]) acc[store] = []
    acc[store].push(item)
    return acc
  }, {})

  console.log(`Order ${orderId} has items for stores: ${Object.keys(itemsByStore).join(', ')}`)

  for (const store of Object.keys(itemsByStore)) {
    const storeItems = itemsByStore[store]
    const storeSubtotal = storeItems.reduce((acc: number, item: any) => acc + Number(item.total_price), 0)
    // shipping cost simplificado (dividir pelo numero de lojas se houver)
    const shippingVal = Number(order.shipping_cost || 0) / Object.keys(itemsByStore).length

    const orderPayload = {
      id: `${order.id}-${store}`,
      total: storeSubtotal + shippingVal,
      customer: {
        name: profile?.full_name || 'Teste Local',
        email: profile?.email || 'teste@kings.com',
        cpf_cnpj: profile?.cpf_cnpj || '12345678909',
        phone: profile?.phone || '11999999999'
      },
      shipping: order.shipping_address,
      shipping_cost: shippingVal,
      items: storeItems.map((i: any) => {
         let uf = order.shipping_address?.state || ''
         if (!uf && order.shipping_address?.cidade && order.shipping_address.cidade.includes('/')) {
           uf = order.shipping_address.cidade.split('/')[1].trim()
         }
         const cfopCalculado = (uf.toUpperCase() === 'SP') ? '5102' : '6102'

         return {
           product_id: i.product?.sku || i.product_id,
           title: i.product?.title || 'Item',
           quantity: i.quantity,
           unit_price: i.unit_price,
           ncm: i.product?.ncm || '',
           gtin: i.product?.ean || 'SEM GTIN',
           origem: '0',
           cfop: cfopCalculado
         }
      })
    }

    console.log(`\n=== INJECTING TO ${store.toUpperCase()} ===`)
    try {
      const token = store === 'seven' ? process.env.OLIST_API_KEY_SEVEN : process.env.OLIST_API_KEY_KINGS
      const res = await pushOrderToOlist(orderPayload, store, token)
      
      if (res && res.status !== 'error') {
         await supabase.from('invoices').insert({
          order_id: order.id,
          store_origin: store,
          erp_id: res.tiny_id || res.id || '',
          cnpj_emitente: '',
          nfe_number: '',
          nfe_key: '',
          status: 'pending',
          xml_url: '',
          pdf_url: ''
        })
        console.log(`✅ Invoice saved to DB!`)
      }
    } catch (err) {
      console.error('Failed', err)
    }
  }
}

run()
