'use server'

import { createAdminClient } from '@kings/db/server'

export async function validateCouponCode(code: string, brand?: 'kings' | 'msu') {
  if (!code) {
    return { success: false, error: 'Código não fornecido' }
  }

  const supabase = createAdminClient()
  
  // Usa service_role para ler cupons, pois a policy RLS "esconde" eles de usuários comuns
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (error || !coupon) {
    return { success: false, error: 'Cupom inválido ou inexistente' }
  }

  if (!coupon.is_active) {
    return { success: false, error: 'Cupom desativado' }
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { success: false, error: 'Cupom expirado' }
  }

  if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
    return { success: false, error: 'Limite de uso esgotado' }
  }

  if (brand && coupon.brand_scope && coupon.brand_scope !== brand) {
    const scopeName = coupon.brand_scope === 'kings' ? 'Kings Simuladores' : 'Meu Simulador Usado'
    return { success: false, error: `Cupom válido apenas para produtos ${scopeName}` }
  }

  return { success: true, coupon }
}
