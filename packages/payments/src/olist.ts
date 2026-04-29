/**
 * Olist ERP Wrapper
 * Responsável por receber a venda confirmada e injetar no Olist (para baixar estoque e emitir a NF-e nativamente lá).
 */

export interface OlistOrderInput {
  id: string
  total: number
  customer: {
    name: string
    email: string
    cpf_cnpj?: string
    phone?: string
  }
  shipping: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    zip: string
    city: string
    state: string
  }
  items?: Array<{
    product_id: string
    title: string
    quantity: number
    unit_price: number
  }>
}

export const pushOrderToOlist = async (orderPayload: OlistOrderInput, brand_origin: string) => {
  const token = brand_origin === 'seven' 
    ? process.env.OLIST_API_KEY_SEVEN 
    : (process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN)
  
  if (token && !token.includes('preencher')) {
    try {
      console.log(`[Tiny ERP] Injetando Pedido ${orderPayload.id} (Empresa: ${brand_origin})...`)
      
      const tinyPedido = {
        pedido: {
          data_pedido: new Date().toLocaleDateString('pt-BR'),
          cliente: {
            nome: orderPayload.customer.name || 'Cliente Avulso',
            cpf_cnpj: orderPayload.customer.cpf_cnpj || '00000000000',
            email: orderPayload.customer.email || '',
            fone: orderPayload.customer.phone || ''
          },
          endereco_entrega: {
            endereco: orderPayload.shipping.street,
            numero: orderPayload.shipping.number,
            complemento: orderPayload.shipping.complement || '',
            bairro: orderPayload.shipping.neighborhood,
            cep: orderPayload.shipping.zip.replace(/\\D/g, ''),
            cidade: orderPayload.shipping.city,
            uf: orderPayload.shipping.state
          },
          itens: (orderPayload.items || []).map(item => ({
            item: {
              codigo: item.product_id,
              descricao: item.title,
              quantidade: item.quantity,
              valor_unitario: item.unit_price
            }
          })),
          valor_frete: 0,
          valor_desconto: 0,
          forma_pagamento: 'Pix',
          situacao: 'Aprovado'
        }
      }

      const params = new URLSearchParams()
      params.append('token', token)
      params.append('formato', 'json')
      params.append('pedido', JSON.stringify(tinyPedido))

      const res = await fetch('https://api.tiny.com.br/api2/pedido.incluir.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (res.ok) {
        const data = await res.json()
        if (data.retorno && data.retorno.status === 'OK') {
          return { 
            id: data.retorno.registros?.[0]?.registro?.id || `tiny_${orderPayload.id}`,
            tiny_id: data.retorno.registros?.[0]?.registro?.id,
            status: 'synced',
          }
        } else {
           console.error('[Tiny ERP] Retorno da API com erro de validação:', data.retorno.erros)
        }
      }
    } catch (e) {
      console.error('[Tiny ERP] Erro crítico de comunicação HTTP ao empurrar pedido:', e)
    }
  }

  // ============== FALLBACK (MOCK) =================
  console.log(`[Olist MOCK] Pedido ${orderPayload.id} "recebido" pelo ERP MOCK.`)
  
  return {
    id: `mock_erp_id_${Math.floor(Math.random() * 8888)}`,
    tiny_id: `mock_erp_id_${Math.floor(Math.random() * 8888)}`,
    status: 'synced_mock',
    cnpj_emitente: brand_origin === 'kings' ? '30.985.492/0001-99' : '12.345.678/0001-99',
    nfe_number: `${Math.floor(Math.random() * 9999)}`,
    nfe_key: `352402309854920001995500100000${Math.floor(Math.random() * 9999)}1475736113`,
    xml_url: 'https://mock.olist.com/xml/download',
    pdf_url: 'https://mock.olist.com/pdf/download'
  }
}
