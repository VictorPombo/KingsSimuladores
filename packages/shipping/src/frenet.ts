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

const FRENET_BASE = 'https://api.frenet.com.br'

// CEP de origem fixo do armazém Kings
const SENDER_POSTAL_CODE = process.env.FRENET_SENDER_CEP || '06407120'

// Peso e dimensões padrão por item caso o produto não tenha dados cadastrados
const DEFAULT_WEIGHT_KG = 5
const DEFAULT_LENGTH_CM = 60
const DEFAULT_HEIGHT_CM = 40
const DEFAULT_WIDTH_CM  = 40

/**
 * Geração de Etiqueta via Frenet API V2.
 * Fluxo: POST /cart → POST /shipment/checkout → POST /shipment/generate
 * Lança erro em caso de falha para que o sistema de retry do cron reprocesse.
 */
export async function generateShippingLabel(orderData: any, itemsData: any[]) {
  const token = process.env.FRENET_TOKEN

  if (!token || token.includes('preencher')) {
    throw new Error('[Frenet] FRENET_TOKEN não configurado. Impossível gerar etiqueta.')
  }

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'token': token,
  }

  const recipientPostalCode = (
    orderData.shipping_address?.cep ||
    orderData.shipping_address?.zip_code ||
    ''
  ).replace(/\D/g, '')

  if (!recipientPostalCode || recipientPostalCode.length < 8) {
    throw new Error(`[Frenet] CEP do destinatário inválido para o pedido #${orderData.id}: "${recipientPostalCode}"`)
  }

  const shippingServiceId = orderData.shipping_service_id
  if (!shippingServiceId) {
    throw new Error(`[Frenet] shipping_service_id ausente no pedido #${orderData.id}. Necessário para gerar etiqueta.`)
  }

  console.log(`[Frenet] Gerando etiqueta para pedido #${orderData.id} | Serviço: ${shippingServiceId}`)

  // — Passo 1: Criar carrinho logístico —
  const cartPayload = {
    Shipper: {
      PostalCode: SENDER_POSTAL_CODE.replace(/\D/g, ''),
    },
    Recipient: {
      PostalCode: recipientPostalCode,
      Name: orderData.shipping_address?.nome || orderData.shipping_address?.destinatario || 'Destinatário',
      Document: orderData.shipping_address?.cpf || '',
      Phone: orderData.shipping_address?.telefone || '',
      Address: orderData.shipping_address?.logradouro || '',
      Number: orderData.shipping_address?.numero || 'S/N',
      Complement: orderData.shipping_address?.complemento || '',
      Neighborhood: orderData.shipping_address?.bairro || '',
      City: orderData.shipping_address?.cidade || '',
      State: orderData.shipping_address?.estado || orderData.shipping_address?.uf || '',
    },
    ShipmentInvoiceValue: Number(orderData.total || 0),
    ShippingServiceCode: shippingServiceId,
    ShippingItemArray: itemsData.map((item: any, index: number) => ({
      SKU: item.product?.sku || item.product_id || `ITEM-${index + 1}`,
      Category: 'Simulador',
      Description: item.product?.title || 'Item',
      Quantity: item.quantity || 1,
      Weight: item.product?.weight_kg || DEFAULT_WEIGHT_KG,
      Length: item.product?.length_cm || DEFAULT_LENGTH_CM,
      Height: item.product?.height_cm || DEFAULT_HEIGHT_CM,
      Width: item.product?.width_cm || DEFAULT_WIDTH_CM,
      UnitaryValue: item.unit_price || 0,
    })),
    OrderNumber: orderData.id,
  }

  const cartRes = await fetch(`${FRENET_BASE}/api/v2/me/cart`, {
    method: 'POST',
    headers,
    body: JSON.stringify(cartPayload),
  })

  if (!cartRes.ok) {
    const errText = await cartRes.text()
    throw new Error(`[Frenet] Falha ao criar carrinho logístico (HTTP ${cartRes.status}): ${errText}`)
  }

  const cartData = await cartRes.json()
  const cartId = cartData?.CartId || cartData?.cartId || cartData?.id
  if (!cartId) {
    throw new Error(`[Frenet] CartId não retornado pela API. Resposta: ${JSON.stringify(cartData)}`)
  }

  console.log(`[Frenet] Carrinho criado. CartId: ${cartId}`)

  // — Passo 2: Checkout com saldo da carteira Frenet —
  const checkoutRes = await fetch(`${FRENET_BASE}/api/v2/me/shipment/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ CartId: cartId }),
  })

  if (!checkoutRes.ok) {
    const errText = await checkoutRes.text()
    // Saldo insuficiente é erro operacional — lança para o retry tratar
    throw new Error(`[Frenet] Falha no checkout da etiqueta (HTTP ${checkoutRes.status}): ${errText}`)
  }

  const checkoutData = await checkoutRes.json()
  console.log(`[Frenet] Checkout concluído. CartId: ${cartId}`)

  // — Passo 3: Gerar etiqueta e obter tracking + PDF —
  const generateRes = await fetch(`${FRENET_BASE}/api/v2/me/shipment/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ CartId: cartId }),
  })

  if (!generateRes.ok) {
    const errText = await generateRes.text()
    throw new Error(`[Frenet] Falha ao gerar etiqueta (HTTP ${generateRes.status}): ${errText}`)
  }

  const generateData = await generateRes.json()

  // A Frenet retorna um array de shipments; pegamos o primeiro (pedido com 1 remetente)
  const shipment = Array.isArray(generateData?.Shipments)
    ? generateData.Shipments[0]
    : generateData

  const trackingCode = shipment?.TrackingNumber || shipment?.tracking_number || null
  const ticketUrl   = shipment?.LabelUrl || shipment?.label_url || shipment?.TicketUrl || null

  if (!trackingCode) {
    throw new Error(`[Frenet] TrackingNumber não retornado. Resposta: ${JSON.stringify(generateData)}`)
  }

  console.log(`[Frenet] Etiqueta gerada com sucesso! Tracking: ${trackingCode}`)

  return {
    success: true,
    tracking_code: trackingCode as string,
    ticket_url: ticketUrl as string | null,
  }
}
