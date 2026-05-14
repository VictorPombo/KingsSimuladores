'use server'

import { createServerSupabaseClient, createAdminClient } from '@kings/db/server'
import { revalidatePath } from 'next/cache'

export async function createCoupon(formData: FormData) {
  const code = formData.get('code')?.toString().toUpperCase()
  const type = formData.get('type')?.toString() as 'percent' | 'fixed' | 'shipping'
  const value = parseFloat(formData.get('value')?.toString() || '0')
  const brandScope = formData.get('brand_scope')?.toString() as 'kings' | 'msu' | 'all'
  const expiresAt = formData.get('expires_at')?.toString()
  const usageLimit = formData.get('usage_limit')?.toString()

  const influencerName = formData.get('influencer_name')?.toString() || null
  const affiliatePercentage = parseFloat(formData.get('affiliate_percentage')?.toString() || '0')

  if (!code || !type || value < 0) {
    return { error: 'Preencha os campos obrigatórios corretamente' }
  }

  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { error } = await supabase.from('coupons').insert({
    code,
    type,
    value,
    brand_scope: brandScope === 'all' ? null : brandScope,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
    influencer_name: influencerName,
    affiliate_percentage: affiliatePercentage,
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

export async function editCoupon(id: string, formData: FormData) {
  const code = formData.get('code')?.toString().toUpperCase()
  const type = formData.get('type')?.toString() as 'percent' | 'fixed' | 'shipping'
  const value = parseFloat(formData.get('value')?.toString() || '0')
  const brandScope = formData.get('brand_scope')?.toString() as 'kings' | 'msu' | 'all'
  const expiresAt = formData.get('expires_at')?.toString()
  const usageLimit = formData.get('usage_limit')?.toString()
  const influencerName = formData.get('influencer_name')?.toString() || null
  const affiliatePercentage = parseFloat(formData.get('affiliate_percentage')?.toString() || '0')

  if (!code || !type || value < 0) {
    return { error: 'Preencha os campos obrigatórios corretamente' }
  }

  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.from('coupons').update({
    code,
    type,
    value,
    brand_scope: brandScope === 'all' ? null : brandScope,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
    influencer_name: influencerName,
    affiliate_percentage: affiliatePercentage,
  }).eq('id', id)

  if (error) {
    console.error('Error updating coupon:', error)
    return { error: 'Erro ao atualizar cupom.' }
  }

  revalidatePath('/admin/cupons')
  return { success: true }
}

export async function getCouponOrders(couponId: string) {
  const supabase = createAdminClient()
  
  // Buscar pedidos que usaram o cupom e têm status pago, enviado ou entregue
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      total,
      status,
      profiles!customer_id ( full_name )
    `)
    .eq('coupon_id', couponId)
    .in('status', ['paid', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching coupon orders:', error)
    return { error: 'Erro ao buscar histórico de uso.' }
  }

  return { orders: data || [] }
}
