import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@kings/db/server'
import { Card } from '@kings/ui'
import { Badge } from '@kings/ui'
import { ProductCard } from '@kings/ui'
import Link from 'next/link'

export const revalidate = 0

// Force dynamic since we use dynamic params inside a RSC without static generation path mapping yet
export const dynamic = 'force-dynamic'

export default async function VendedorProfilePage({ params }: { params: { id: string } }) {
  const sellerId = params.id
  const supabase = await createServerSupabaseClient()

  // 1. Fetch Seller Profile
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', sellerId)
    .single()

  if (profileErr || !profile) {
    return notFound()
  }

  // 2. Fetch Active Listings
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // 3. Calculate Average Rating
  const { data: reviews } = await supabase
    .from('seller_reviews')
    .select('rating, comment, reviewer_id, profiles(full_name)')
    .eq('seller_id', sellerId)

  let averageRating = 0
  if (reviews && reviews.length > 0) {
    const total = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    averageRating = total / reviews.length
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Seller Header Section */}
      <Card className="mb-8 border-cyan-800/50 bg-[#0A0D14]">
        <div className="flex flex-col md:flex-row items-center gap-6 pt-6 p-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500 bg-gray-800">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-cyan-400">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">{Array.isArray(profile) ? (profile as any)[0]?.full_name : profile.full_name}</h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
              <Badge variant="info" className="text-cyan-400 border-cyan-500/50">
                ⭐ {averageRating > 0 ? averageRating.toFixed(1) : 'Novo'}{' '}
                ({reviews?.length || 0} avaliações)
              </Badge>
              <Badge variant="info" className="text-gray-400 border-gray-600">
                {listings?.length || 0} Peças Ativas
              </Badge>
              {profile.role === 'admin' && (
                <Badge variant="danger" className="bg-red-600 hover:bg-red-700">Equipe Oficial</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Grid de Anúncios */}
      <h2 className="text-2xl font-orbitron font-semibold text-white mb-6 border-b border-gray-800 pb-2">
        Garagem de Simuladores ({listings?.length || 0})
      </h2>
      
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <Link href={`/usado/produtos/${item.id}`} key={item.id} className="block">
              <ProductCard 
                id={item.id}
                title={item.title}
                price={item.price}
                imageUrl={(item.images as string[])[0] || ''}
                brand={'msu'}
              />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Este vendedor não possui peças engatilhadas no momento.</p>
      )}

      {/* Avaliações Recentes */}
      <h2 className="text-2xl font-orbitron font-semibold text-white mt-12 mb-6 border-b border-gray-800 pb-2">
        Reputação ({reviews?.length || 0})
      </h2>

      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.slice(0, 8).map((rev, idx) => (
            <Card key={idx} className="bg-gray-900 border-gray-800">
              <div className="pt-6 p-6">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-cyan-300">{Array.isArray(rev.profiles) ? (rev.profiles as any)[0]?.full_name : (rev.profiles as any)?.full_name || 'Comprador Verificado'}</span>
                  <span className="text-yellow-400">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                </div>
                <p className="text-gray-400 italic">"{rev.comment || 'Nenhum comentário.'}"</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Nenhum comprador atestou a fumaça de pneu deste vendedor ainda.</p>
      )}
    </div>
  )
}
