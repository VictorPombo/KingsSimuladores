'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@kings/db/server'

export async function markCommissionPaid(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  // Verify Admin Action Security
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
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
