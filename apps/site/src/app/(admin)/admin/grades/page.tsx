import { createServerSupabaseClient } from '@kings/db/server'
import { GradesClient } from './GradesClient'

export const dynamic = 'force-dynamic'

export default async function AdminGradesPage() {
  const supabase = await createServerSupabaseClient()
  
  // Try fetching. If table doesn't exist yet (migration not applied), it'll be an error, so we catch it.
  const { data: grids } = await supabase
    .from('variation_grids')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <GradesClient grids={grids || []} />
    </div>
  )
}
