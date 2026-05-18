import { createServerSupabaseClient } from '@kings/db/server'
import { CuponsClient } from './CuponsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444', background: '#1e1e1e', minHeight: '100vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', background: '#2c2e36', borderRadius: '12px', border: '1px solid #ef444440', textAlign: 'center' }}>
          <p style={{ fontWeight: 600 }}>Erro ao carregar cupons</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <CuponsClient initialCoupons={coupons || []} />
    </div>
  )
}
