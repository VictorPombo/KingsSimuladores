import { createAdminClient } from '@kings/db'
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AvaliacoesPage() {
  const supabase = createAdminClient()
  const { data: reviews } = await supabase
    .from('seller_reviews')
    .select('id, rating, comment, created_at, reviewer_id, seller_id, profiles!reviewer_id(full_name)')
    .order('created_at', { ascending: false })

  const totalReviews = reviews?.length || 0
  const avgRating = totalReviews > 0 
    ? ((reviews as any[]).reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : '0'
  const fiveStars = (reviews as any[] || []).filter((r: any) => r.rating === 5).length
  const fourStars = (reviews as any[] || []).filter((r: any) => r.rating === 4).length

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Avaliações</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Feedback de compradores sobre vendedores do marketplace</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { icon: <MessageSquare size={18} color="#8b5cf6" />, label: 'Total Avaliações', value: totalReviews, color: '#fff' },
            { icon: <Star size={18} color="#f59e0b" />, label: 'Nota Média', value: `${avgRating} ★`, color: '#f59e0b' },
            { icon: <TrendingUp size={18} color="#10b981" />, label: '5 Estrelas', value: fiveStars, color: '#10b981' },
            { icon: <Users size={18} color="#22d3ee" />, label: '4 Estrelas', value: fourStars, color: '#22d3ee' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#2c2e36', borderRadius: '10px', padding: '16px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: '#1f2025', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kpi.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: kpi.color, marginTop: '2px' }}>{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(!reviews || reviews.length === 0) ? (
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              Nenhuma avaliação registrada ainda.
            </div>
          ) : (reviews as any[]).map((r: any) => (
            <div key={r.id} style={{
              background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {(r.profiles?.full_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{r.profiles?.full_name || 'Anônimo'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                      {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ color: star <= r.rating ? '#f59e0b' : '#3f424d', fontSize: '1.1rem' }}>★</span>
                  ))}
                </div>
              </div>
              {/* Comentário */}
              {r.comment && (
                <div style={{
                  color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '1.6', padding: '12px 16px',
                  background: '#1f2025', borderRadius: '8px', borderLeft: '3px solid #8b5cf640',
                }}>
                  "{r.comment}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
