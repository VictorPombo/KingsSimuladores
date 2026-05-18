import { createServerSupabaseClient } from '@kings/db/server'
import { CategoriasClient } from './CategoriasClient'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('categories').select('id, name, slug, brand_scope, sort_order, parent_id').order('sort_order')
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <CategoriasClient categories={(data as any) || []} />
    </div>
  )
}
