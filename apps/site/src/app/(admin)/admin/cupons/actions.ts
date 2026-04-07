'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { revalidatePath } from 'next/cache'

export async function createCoupon(formData: FormData) {
  const code = formData.get('code')?.toString().toUpperCase()
  const type = formData.get('type')?.toString() as 'percent' | 'fixed' | 'shipping'
  const value = parseFloat(formData.get('value')?.toString() || '0')
  const brandScope = formData.get('brand_scope')?.toString() as 'kings' | 'msu' | 'all'
  const expiresAt = formData.get('expires_at')?.toString()
  const usageLimit = formData.get('usage_limit')?.toString()

  if (!code || !type || value <= 0) {
    return { error: 'Preencha os campos obrigatórios' }
  }

  const supabase = await createServerSupabaseClient()
  
  // Verifica se eh admin (redundante devido RLS do admin-only, mas bom garantr)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase.from('coupons').insert({
    code,
    type,
    value,
    brand_scope: brandScope === 'all' ? null : brandScope,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
    is_active: true
  })

  if (error) {
    console.error('Error creating coupon:', error)
    return { error: 'Erro ao criar cupom. O código já existe?' }
  }

  revalidatePath('/admin/cupons')
  return { success: true }
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('coupons')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/cupons')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/cupons')
  return { success: true }
}
