/**
 * Mercado Pago API Mock/Stub for Development
 * Subsitute with @mercadopago/sdk-nodejs later when API keys are available
 */
export async function createPreference(items: any[], customer: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Return a dummy preference ID for checkout usage
  return {
    id: 'mock_pref_123456789_abcdef',
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
