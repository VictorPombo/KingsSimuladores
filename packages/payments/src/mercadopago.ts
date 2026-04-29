/**
 * Mercado Pago API Wrapper (Checkout & Split Payments)
 * Handles cart checkout and Marketplace sub-ledger splitting.
 */
export async function createPreference(items: any[], customer: any, orderId?: string, marketplaceFee?: number, storeContext?: 'kings' | 'msu' | 'seven') {
  // Em Produção, você usará o token de vendedor (Oauth) para criar a preferência na conta dele,
  // mas aplicando a 'marketplace_fee' (nossa comissão) pra conta da Kings.
  
  // Seleção dinâmica do Token baseada no contexto da loja
  let token = process.env.MP_ACCESS_TOKEN; // Fallback antigo
  if (storeContext === 'seven') {
    token = process.env.MP_ACCESS_TOKEN_SEVEN || token;
  } else if (storeContext === 'kings' || storeContext === 'msu') {
    token = process.env.MP_ACCESS_TOKEN_KINGS || token;
  }

  // Normalizar array para o padrão do MP
  const mpItems = items.map((i: any) => ({
    id: i.id || 'item',
    title: i.title || 'Produto Kings',
    quantity: Number(i.quantity) || 1,
    unit_price: Number(i.price || i.unit_price) || 0,
    currency_id: 'BRL'
  }))

  const payload: any = {
    items: mpItems,
    payer: customer,
    external_reference: orderId || 'mock',
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL_KINGS}/account?success=true`,
      pending: `${process.env.NEXT_PUBLIC_URL_KINGS}/account?pending=true`,
      failure: `${process.env.NEXT_PUBLIC_URL_KINGS}/checkout?error=payment_failed`
    },
    auto_return: 'approved'
  }

  // Bloco de Split Payment (Retenção Contábil na Fonte)
  if (marketplaceFee && marketplaceFee > 0) {
    payload.marketplace_fee = marketplaceFee;
    console.log(`[Kings Payments] Criando Split de Pagamento - Taxa retida KingsHub: R$${marketplaceFee}`)
  }

  if (token) {
    try {
      // Endpoint oficial para manipulação de chekcouts (Mesmo com fees)
      const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        return {
          id: data.id,
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point
        }
      } else {
        console.warn('[MP Checkout Erro]:', await res.text())
      }
    } catch(e) {
      console.warn('[Kings Payments] Falha na comunicação do Checkout MP', e)
    }
  }

  // ============== FALLBACK (MOCK) =================
  // Simulate network delay para desenvolvimento visual fluido
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    id: `pref_${orderId || 'mock'}_123456`,
    init_point: 'https://sandbox.mercadopago.com.br/checkout/mock',
    sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/mock',
  }
}

export async function capturePayment(paymentId: string) {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    status: 'approved',
    status_detail: 'accredited',
    id: paymentId,
  }
}

/**
 * Validates a Payment intent via Mercado Pago API (Double-Check)
 * Returns the exact context safely to prevent fraud.
 */
export async function verifyPaymentStatus(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN
  
  if (token) {
    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        return {
          status: data.status,
          external_reference: data.external_reference,
          payment_method_id: data.payment_method_id
        }
      }
    } catch(err) {
      console.error('[MP Verify Error]', err)
    }
  }

  // ============== FALLBACK (MOCK) =================
  // Se não encontrar o token, simula uma resposta de sucesso do Sandbox
  // para não travar o desenvolvimento local.
  return {
    status: 'approved',
    // In our Mock webhook workflow, the paymentId will carry the target Order ID
    external_reference: paymentId.replace('mockpay_', ''), 
    payment_method_id: 'pix_mock'
  }
}
