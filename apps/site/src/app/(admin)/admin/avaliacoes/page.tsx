import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function AvaliacoesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: reviews } = await supabase
    .from('seller_reviews')
    .select('id, rating, comment, created_at, reviewer_id, seller_id, profiles!reviewer_id(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Avaliações</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Avaliações de vendedores do marketplace</p>
        </div>

        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {['Avaliador', 'Nota', 'Comentário', 'Data'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!reviews || reviews.length === 0) ? (
                  <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    Nenhuma avaliação registrada ainda.
                  </td></tr>
                ) : reviews.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #3f424d' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{r.profiles?.full_name || 'Anônimo'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(star => (
                          <span key={star} style={{ color: star <= r.rating ? '#f59e0b' : '#3f424d', fontSize: '1rem' }}>★</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
