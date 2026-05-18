'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@kings/db/server'

export async function markCommissionPaid(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  // Verify Admin Action Security
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('auth_id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return
  }

  const commissionId = formData.get('commission_id') as string

  const { error } = await supabase
    .from('commissions')
    .update({ 
      payout_status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('id', commissionId)

  if (error) {
    console.error('Falha ao baixar pagamento:', error)
  }

  // Refresh
  redirect('/admin/comissoes')
}

export async function updateCommissionRate(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  // Verify Admin Action Security
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('auth_id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return
  }

  const newRate = formData.get('commission_rate') as string
  if (!newRate) return

  // We are storing the rate as a decimal (e.g. 0.13 for 13%)
  // So if the user submits "13", we convert it to 0.13
  const rateFloat = parseFloat(newRate)
  if (isNaN(rateFloat) || rateFloat < 0 || rateFloat > 100) return
  
  const decimalRate = rateFloat / 100

  const { error } = await supabase
    .from('platform_settings')
    .upsert({ 
      key: 'msu_commission_rate',
      value: decimalRate.toString()
    })

  if (error) {
    console.error('Falha ao atualizar taxa:', error)
  }

  redirect('/admin/comissoes')
}
