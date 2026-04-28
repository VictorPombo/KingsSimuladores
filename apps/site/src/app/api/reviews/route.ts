import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

// GET — busca avaliações de um usuário
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

    const supabase = await createServerSupabaseClient()

    // Buscar reviews recebidas pelo user
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name)')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Calcular stats
    const totalReviews = reviews?.length || 0
    const avgRating = totalReviews > 0
      ? reviews!.reduce((sum, r) => sum + (r.rating_general || 0), 0) / totalReviews
      : 0

    return NextResponse.json({
      reviews: reviews || [],
      stats: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — enviar avaliação
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { order_id, reviewed_id, reviewer_role, rating_general, rating_communication, rating_as_described, rating_shipping, rating_rules, comment } = body

    if (!order_id || !reviewed_id || !reviewer_role || !rating_general) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase.from('reviews').insert({
      order_id,
      reviewer_id: user.id,
      reviewed_id,
      reviewer_role,
      rating_general,
      rating_communication: rating_communication || null,
      rating_as_described: rating_as_described || null,
      rating_shipping: rating_shipping || null,
      rating_rules: rating_rules || null,
      comment: comment?.trim() || null,
    }).select().single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Você já avaliou esta transação' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ review: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
