/**
 * Mercado Pago API Wrapper (Checkout & Split Payments)
 * Handles cart checkout and Marketplace sub-ledger splitting.
 * 
 * PRODUÇÃO — Sem fallbacks. Se falhar, lança erro.
 */

const ACCESS_TOKENS: Record<string, string | undefined> = {
  kings: process.env.MP_ACCESS_TOKEN_KINGS || process.env.MP_ACCESS_TOKEN,
  usado: process.env.MP_ACCESS_TOKEN_MSU || process.env.MP_ACCESS_TOKEN,
  seven: process.env.MP_ACCESS_TOKEN_SEVEN,
  sabrina_prado: process.env.MP_ACCESS_TOKEN_KINGS || process.env.MP_ACCESS_TOKEN,
}

const PUBLIC_KEYS: Record<string, string | undefined> = {
  kings: process.env.MP_PUBLIC_KEY_KINGS || process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
  usado: process.env.MP_PUBLIC_KEY_MSU || process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
  seven: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY_SEVEN || process.env.MP_PUBLIC_KEY_SEVEN,
  sabrina_prado: process.env.MP_PUBLIC_KEY_KINGS || process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
}

export function getMPAccessToken(storeSlug: string): string {
  const token = ACCESS_TOKENS[storeSlug] ?? process.env.MP_ACCESS_TOKEN
  if (!token) {
    throw new Error(`[Kings Payments] Token do Mercado Pago não configurado para a loja "${storeSlug}". Verifique as variáveis de ambiente.`)
  }
  return token
}

export function getMPPublicKey(storeSlug: string): string {
  return PUBLIC_KEYS[storeSlug] ?? process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? ''
}

export async function createPreference(items: any[], customer: any, orderId?: string, marketplaceFee?: number, storeContext?: 'kings' | 'msu' | 'seven' | 'sabrina_prado', shippingCost?: number, pixOnly?: boolean) {
  // Em Produção, você usará o token de vendedor (Oauth) para criar a preferência na conta dele,
  // mas aplicando a 'marketplace_fee' (nossa comissão) pra conta da Kings.
  // Seleção dinâmica do Token baseada no contexto da loja
  const token = getMPAccessToken(storeContext || 'kings')

  // Normalizar array para o padrão do MP
  const mpItems = items.map((i: any) => ({
    id: i.id || 'item',
    title: i.title || 'Produto Kings',
    quantity: Number(i.quantity) || 1,
    unit_price: Number(i.price || i.unit_price) || 0,
    currency_id: 'BRL'
  }))

  if (shippingCost && shippingCost > 0) {
    mpItems.push({
      id: 'shipping',
      title: 'Frete',
      quantity: 1,
      unit_price: shippingCost,
      currency_id: 'BRL'
    })
  }

  const payload: any = {
    items: mpItems,
    payer: {
      name: customer.nome || customer.name || '',
      email: customer.email || '',
      identification: customer.cpf ? { type: 'CPF', number: customer.cpf.replace(/\D/g, '') } : undefined,
      phone: customer.telefone ? { 
        area_code: customer.telefone.replace(/\D/g, '').substring(0, 2), 
        number: customer.telefone.replace(/\D/g, '').substring(2) 
      } : undefined
    },
    external_reference: orderId || undefined,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL_KINGS}/account?success=true`,
      pending: `${process.env.NEXT_PUBLIC_URL_KINGS}/account?pending=true`,
      failure: `${process.env.NEXT_PUBLIC_URL_KINGS}/checkout?error=payment_failed`
    },
    auto_return: 'approved',
    payment_methods: {
      installments: pixOnly ? 1 : 12,
      // Quando pixOnly=true, bloqueia cartão de crédito, débito, boleto e pré-pago.
      // Quando pixOnly=false (fluxo de cartão), bloqueia o Pix para obrigar o cliente a usar o botão nativo de Pix com 10% de desconto.
      ...(pixOnly ? {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' },
          { id: 'prepaid_card' },
          { id: 'atm' },
          { id: 'digital_currency' },
        ]
      } : {
        excluded_payment_types: [
          { id: 'bank_transfer' }
        ],
        excluded_payment_methods: [
          { id: 'pix' }
        ]
      })
    },
    // IMPORTANTE: Forçar www para evitar redirect 301 da Vercel que quebra o webhook do MP
    notification_url: `https://www.kingssimuladores.com.br/api/webhooks/mercadopago?store=${storeContext || 'kings'}`
  }

  // Bloco de Split Payment (Retenção Contábil na Fonte)
  if (marketplaceFee && marketplaceFee > 0) {
    payload.marketplace_fee = marketplaceFee;
    console.log(`[Kings Payments] Criando Split de Pagamento - Taxa retida KingsHub: R$${marketplaceFee}`)
  }

  // Chamada real para o Mercado Pago
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errorBody = await res.text()
    console.error(`[MP Checkout Erro] Status ${res.status}:`, errorBody)
    throw new Error(`Falha ao criar preferência de pagamento no Mercado Pago (HTTP ${res.status}). Verifique as credenciais.`)
  }

  const data = await res.json()
  return {
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point
  }
}

/**
 * Validates a Payment intent via Mercado Pago API (Double-Check)
 * Returns the exact context safely to prevent fraud.
 * 
 * PRODUÇÃO — Sem bypass. Só aceita resposta real do MP.
 */
export async function verifyPaymentStatus(paymentId: string, storeContext?: string) {
  const token = storeContext ? getMPAccessToken(storeContext) : getMPAccessToken('kings')

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })

  if (!res.ok) {
    const errorBody = await res.text()
    console.error(`[MP Verify Erro] Status ${res.status}:`, errorBody)
    throw new Error(`Falha ao verificar pagamento ${paymentId} no Mercado Pago (HTTP ${res.status})`)
  }

  const data = await res.json()
  return {
    status: data.status,
    external_reference: data.external_reference,
    payment_method_id: data.payment_method_id,
    payment_type_id: data.payment_type_id,
    installments: data.installments
  }
}
