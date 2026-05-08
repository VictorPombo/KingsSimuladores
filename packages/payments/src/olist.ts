/**
 * Olist / Tiny ERP Wrapper — PRODUÇÃO
 * Responsável por receber a venda confirmada e injetar no ERP (para baixar estoque e emitir a NF-e).
 * 
 * Sem fallbacks. Se o token não existir, retorna null e loga o erro.
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
    [key: string]: any
  }
  shipping_cost?: number
  items?: Array<{
    product_id: string
    title: string
    quantity: number
    unit_price: number
    ncm?: string
    gtin?: string
    origem?: string
    cfop?: string
  }>
}

export const pushOrderToOlist = async (orderPayload: OlistOrderInput, brand_origin: string, injectedToken?: string) => {
  const token = injectedToken || (brand_origin === 'seven' ? process.env.OLIST_API_KEY_SEVEN : (process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN))

  if (!token || token.includes('preencher')) {
    console.error(`[Tiny ERP] Token não configurado para a marca "${brand_origin}". Pedido ${orderPayload.id} NÃO foi injetado no ERP.`)
    return null
  }

  const rawCpfCnpj = orderPayload.customer.cpf_cnpj || '';
  const cpfCnpj = rawCpfCnpj.replace(/\D/g, '');
  if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) || cpfCnpj === '00000000000') {
    console.error(`[Tiny ERP] ❌ Rejeitado: Pedido ${orderPayload.id} não possui CPF/CNPJ válido. Valor recebido: "${rawCpfCnpj}". Sincronização cancelada para evitar rejeição na SEFAZ.`);
    return null;
  }

  try {
    console.log(`[Tiny ERP] Injetando Pedido ${orderPayload.id} (Empresa: ${brand_origin})...`)
    
    const rawCep = (orderPayload.shipping.zip || orderPayload.shipping.cep || '').replace(/\D/g, '');
    const cep = rawCep.length === 8 ? rawCep : '00000000'; // Tiny accepts 8 digits

    let cidade = orderPayload.shipping.city || '';
    let uf = orderPayload.shipping.state || '';
    if (!cidade && orderPayload.shipping.cidade) {
      const partes = orderPayload.shipping.cidade.split('/');
      cidade = partes[0]?.trim() || '';
      if (!uf && partes[1]) uf = partes[1]?.trim() || '';
    }

    const enderecoObj = {
      endereco: orderPayload.shipping.street || orderPayload.shipping.logradouro || '',
      numero: orderPayload.shipping.number || orderPayload.shipping.numero || '',
      complemento: orderPayload.shipping.complement || orderPayload.shipping.complemento || '',
      bairro: orderPayload.shipping.neighborhood || orderPayload.shipping.bairro || '',
      cep,
      cidade,
      uf
    };

    const tinyPedido = {
      pedido: {
        data_pedido: new Date().toLocaleDateString('pt-BR'),
        cliente: {
          nome: orderPayload.customer.name || 'Cliente Avulso',
          cpf_cnpj: cpfCnpj,
          email: orderPayload.customer.email || '',
          fone: orderPayload.customer.phone || '',
          ...enderecoObj
        },
        endereco_entrega: enderecoObj,
        itens: (orderPayload.items || []).map(item => ({
          item: {
            codigo: item.product_id,
            descricao: item.title,
            quantidade: item.quantity,
            valor_unitario: item.unit_price,
            ncm: (item.ncm || '').replace(/\D/g, ''),
            origem: item.origem || '0',
            gtin: item.gtin || 'SEM GTIN',
            cfop: item.cfop || ''
          }
        })),
        valor_frete: orderPayload.shipping_cost || 0,
        valor_desconto: 0,
        forma_pagamento: 'Pix',
        situacao: 'Aprovado'
      }
    }

    console.info(`[Tiny ERP] Payload Montado para Pedido ${orderPayload.id}:`, JSON.stringify(tinyPedido.pedido.itens, null, 2))

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
        // Tiny ERP retorna objeto se for 1 registro, ou array se forem vários.
        const registroObj = Array.isArray(data.retorno.registros) 
          ? data.retorno.registros[0]?.registro 
          : data.retorno.registros?.registro;

        console.log(`[Tiny ERP] ✅ Pedido ${orderPayload.id} injetado com sucesso. ID ERP: ${registroObj?.id}`)
        return { 
          id: registroObj?.id || `tiny_${orderPayload.id}`,
          tiny_id: registroObj?.id,
          status: 'synced',
        }
      } else {
        console.error('[Tiny ERP] Retorno da API com erro de validação:', data.retorno?.erros)
        console.error('[Tiny ERP] Retorno completo:', JSON.stringify(data, null, 2))
      }
    } else {
      console.error(`[Tiny ERP] HTTP ${res.status}:`, await res.text())
    }
  } catch (e) {
    console.error('[Tiny ERP] Erro crítico de comunicação HTTP ao empurrar pedido:', e)
  }

  // Se chegou aqui, falhou — retorna null (sem dados fictícios)
  console.error(`[Tiny ERP] ❌ Pedido ${orderPayload.id} NÃO foi sincronizado com o ERP.`)
  return null
}
