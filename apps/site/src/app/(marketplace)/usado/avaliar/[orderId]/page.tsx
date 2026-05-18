import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@kings/db/server'
import { Card } from '@kings/ui'
import { Button } from '@kings/ui'

export const dynamic = 'force-dynamic'
export const revalidate = 60

// Ação Server-side para gravar o review blindando com RLS
async function submitReview(formData: FormData) {
  'use server'
  const supabase = await createServerSupabaseClient()
  
  // Verify User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  const orderId = formData.get('order_id') as string
  const sellerId = formData.get('seller_id') as string
  const rating = parseInt(formData.get('rating') as string, 10)
  const comment = formData.get('comment') as string

  // Insert using the authenticated client (RLS enforced)
  const { error } = await supabase.from('seller_reviews').insert({
    order_id: orderId,
    seller_id: sellerId,
    reviewer_id: user.id,
    rating: rating,
    comment: comment
  })

  if (error) {
    console.error('Falha ao registrar review:', error)
    redirect(`/usado/avaliar/${orderId}?error=true`)
  }

  // Se sucesso, vai pro perfil público ver sua marca registrada!
  redirect(`/usado/vendedor/${sellerId}?reviewed=true`)
}

export default async function AvaliarPedidoPage({ params, searchParams }: { params: { orderId: string }, searchParams: { error?: string } }) {
  const supabase = await createServerSupabaseClient()

  // Verify User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Precisamos resgatar o seller_id desse pedido pra criar o review
  // Num cenário real teríamos que ligar `orders` -> `order_items` -> `marketplace_listings`
  // Para fins contábeis e visuais, vamos resgatar o seller_id da tabela `commissions` que geramos no Webhook!
  const { data: commission, error: orderErr } = await supabase
    .from('commissions')
    .select('seller_id, profiles!seller_id(full_name)')
    .eq('order_id', params.orderId)
    .single()

  if (orderErr || !commission) {
    // Pedido não encontrado ou não tem Split de Marketplace
    return notFound()
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-8">
      <Card className="bg-[#0A0D14] border-cyan-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-orbitron text-cyan-400 text-center">
            Avaliação de Vendedor 🏁
          </h2>
          <p className="text-gray-400 text-center mt-2">
            Compartilhe sua experiência de compra na comunidade. Como foi negociar com <strong className="text-white">{Array.isArray(commission.profiles) ? (commission.profiles as any)[0]?.full_name : (commission.profiles as any)?.full_name}</strong>?
          </p>
        </div>
        <div className="p-6">
          {searchParams.error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-md mb-6 text-sm">
              Erro ao processar sua avaliação. Você já pode ter avaliado este pedido, ou ocorreu um bug no pit-stop!
            </div>
          )}

          <form action={submitReview} className="space-y-6">
            <input type="hidden" name="order_id" value={params.orderId} />
            <input type="hidden" name="seller_id" value={commission.seller_id} />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Nota (1 a 5 estrelas)</label>
              <select 
                name="rating" 
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-md h-12 px-4 focus:border-cyan-500 outline-none"
                required
                defaultValue="5"
              >
                <option value="5">⭐⭐⭐⭐⭐ - Excelente (Cravou o tempo!)</option>
                <option value="4">⭐⭐⭐⭐ - Muito Bom</option>
                <option value="3">⭐⭐⭐ - Ok / Mediano</option>
                <option value="2">⭐⭐ - Ruim (Pit-stop atrasou)</option>
                <option value="1">⭐ - Péssimo (Motor fundiu)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Comentário / Feedback</label>
              <textarea 
                name="comment" 
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-md p-4 focus:border-cyan-500 outline-none resize-none"
                placeholder="Exemplo Válido: O volante chegou impecável, bem embalado e idêntico à descrição. Voltarei a negociar com ele!"
              />
            </div>

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron text-lg h-12">
              ENVIAR AVALIAÇÃO
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
