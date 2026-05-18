import { createAdminClient } from '@kings/db'
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { ReviewsClient } from './ReviewsClient'

export const dynamic = 'force-dynamic'

export default async function AvaliacoesPage() {
  const supabase = createAdminClient()
  const { data: reviews } = await supabase
    .from('seller_reviews')
    .select('id, rating, comment, created_at, reviewer_id, seller_id, profiles!reviewer_id(full_name)')
    .order('created_at', { ascending: false })

  const mapped = (reviews as any[] || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
    reviewer_name: r.profiles?.full_name || 'Anônimo',
  }))

  const totalReviews = mapped.length
  const avgRating = totalReviews > 0
    ? (mapped.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0'
  const fiveStars = mapped.filter(r => r.rating === 5).length
  const fourStars = mapped.filter(r => r.rating === 4).length

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

        {/* Reviews List (Interactive Client Component) */}
        <ReviewsClient reviews={mapped} />
      </div>
    </div>
  )
}
