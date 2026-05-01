/**
 * Frenet API Wrapper — PRODUÇÃO
 * 
 * Transportadoras Ativas:
 *  - Correios SEDEX (expressa)
 *  - Jadlog .Package / .Com
 *  - Azul Cargo Express
 *  - LATAM Cargo
 *  - Buslog
 * 
 * Removido: Correios PAC (logística lenta, incompatível com simuladores pesados)
 * Removido: Todos os fallbacks mock
 */

interface Dimensions {
  weight: number
  width: number
  height: number
  length: number
  quantity?: number
  insurance_value?: number
}

interface ShippingOption {
  id: number;
  name: string;
  company: string;
  price: string;
  custom_delivery_time: number;
  error?: string;
  logo?: string;
}

/**
 * Nomes de serviços que devem ser EXCLUÍDOS dos resultados.
 * Comparação case-insensitive parcial (inclui variações como "PAC", "Mini Envios", etc.)
 */
const BLOCKED_SERVICES = [
  'pac',
  'mini envios',
]

function isBlocked(serviceName: string): boolean {
  const lower = serviceName.toLowerCase()
  return BLOCKED_SERVICES.some(blocked => lower.includes(blocked))
}

export async function calculateShipping(fromPostalCode: string, toPostalCode: string, dimensions: Dimensions[]): Promise<ShippingOption[]> {
  const token = process.env.FRENET_TOKEN

  if (!token || token.includes('preencher')) {
    throw new Error('[Kings Shipping] FRENET_TOKEN não configurado. Impossível calcular frete.')
  }

  const endpoint = 'https://api.frenet.com.br/shipping/quote'

  const payload = {
    SellerCEP: fromPostalCode.replace(/\D/g, ''),
    RecipientCEP: toPostalCode.replace(/\D/g, ''),
    ShipmentInvoiceValue: dimensions.reduce((acc, d) => acc + (d.insurance_value || 0), 0),
    ShippingItemArray: dimensions.map((d, index) => ({
        Weight: d.weight,
        Length: d.length || 16,
        Height: d.height || 2,
        Width: d.width || 11,
        Quantity: d.quantity || 1,
        SKU: (index + 1).toString(),
        Category: "Simulador"
    }))
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'token': `${token}`,
      'User-Agent': 'KingsHub E-commerce Support (contato@kingssimuladores.com.br)'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`[Kings Shipping] Frenet retornou HTTP ${res.status}:`, errorText)
    throw new Error(`Falha na comunicação com a Frenet (HTTP ${res.status})`)
  }

  const json = await res.json()
  const data = json.ShippingQuoteArray || []
  
  // Filter out errors, map to standard shape, then REMOVE blocked services (PAC)
  const validOptions = data
    .filter((opt: any) => !opt.Error && opt.ShippingPrice)
    .filter((opt: any) => !isBlocked(opt.ServiceDescription || ''))
    .map((opt: any) => ({
      id: opt.ServiceCode,
      name: opt.ServiceDescription,
      company: opt.Carrier || opt.ServiceDescription?.split(' ')[0],
      price: opt.ShippingPrice,
      custom_delivery_time: opt.DeliveryTime,
      logo: null
    }))
    .sort((a: ShippingOption, b: ShippingOption) => parseFloat(a.price) - parseFloat(b.price))

  if (validOptions.length === 0) {
    console.warn('[Kings Shipping] Frenet retornou 0 opções válidas para', fromPostalCode, '->', toPostalCode)
  }

  console.log(`[Kings Shipping] ${validOptions.length} opções retornadas (PAC removido)`)
  return validOptions
}

/**
 * Geração de Etiqueta (Frenet)
 * Adiciona ao Carrinho, faz checkout com saldo e gera a URL de impressão logística.
 * 
 * PRODUÇÃO — Se falhar, retorna success: false.
 */
export async function generateShippingLabel(orderData: any, itemsData: any[]) {
  const token = process.env.FRENET_TOKEN

  if (!token || token.includes('preencher')) {
    console.error('[Kings Shipping] FRENET_TOKEN não configurado. Impossível gerar etiqueta.')
    return { success: false, tracking_code: null, ticket_url: null }
  }

  try {
    console.log(`[Frenet] Gerando etiqueta para pedido #${orderData.id}...`)
    
    // TODO: Implementar os 3 passos reais da API Frenet:
    // 1. POST /api/v2/me/cart (Cria o ticket no carrinho)
    // 2. POST /api/v2/me/shipment/checkout (Paga com saldo da carteira)
    // 3. POST /api/v2/me/shipment/generate (Gera a etiqueta pdf)
    // Por enquanto, a etiqueta será gerada manualmente no painel da Frenet.
    
    console.warn(`[Frenet] Geração automática de etiquetas ainda não implementada. Gere manualmente no painel Frenet para o pedido #${orderData.id}.`)
    
    return {
      success: false,
      tracking_code: null,
      ticket_url: null
    }
  } catch (e) {
    console.error('[Kings Shipping] Falha ao gerar etiqueta Frenet:', e)
    return { success: false, tracking_code: null, ticket_url: null }
  }
}
