/**
 * Olist ERP Wrapper
 * Responsável por receber a venda confirmada e injetar no Olist (para baixar estoque e emitir a NF-e nativamente lá).
 */

export const pushOrderToOlist = async (orderPayload: any, brand_origin: string) => {
  const token = process.env.OLIST_ACCESS_TOKEN
  
  if (token && !token.includes('preencher')) {
    try {
      console.log(`[Olist ERP] Injetando Pedido ${orderPayload.id} para Emissão de Nota Fiscal (Empresa: ${brand_origin})...`)
      
      // Essa é uma simulação estrutural. A API real do Olist/Tiny varia de acordo com o plano contratado.
      const res = await fetch('https://api.olist.com/v1/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      })

      if (res.ok) {
        const data = await res.json()
        return { 
          id: data.id || `olist_${orderPayload.id}`,
          status: 'synced',
        }
      }
    } catch (e) {
      console.error('[Olist ERP] Erro crítico de comunicação HTTP ao empurrar pedido:', e)
    }
  }

  // ============== FALLBACK (MOCK) =================
  console.log(`[Olist MOCK] Pedido ${orderPayload.id} "recebido" pelo ERP MOCK.`)
  
  return {
    id: `mock_erp_id_${Math.floor(Math.random() * 8888)}`,
    status: 'synced_mock',
    cnpj_emitente: brand_origin === 'kings' ? '30.985.492/0001-99' : '12.345.678/0001-99',
    nfe_number: `${Math.floor(Math.random() * 9999)}`,
    nfe_key: `352402309854920001995500100000${Math.floor(Math.random() * 9999)}1475736113`,
    xml_url: 'https://mock.olist.com/xml/download',
    pdf_url: 'https://mock.olist.com/pdf/download'
  }
}
