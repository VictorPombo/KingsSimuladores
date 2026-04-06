import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se o profile é realmente seller (ou admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || ((profile as any).role !== 'seller' && (profile as any).role !== 'admin')) {
      return NextResponse.json({ error: 'Você precisa habilitar o modo Vendedor na sua conta primeiro.' }, { status: 403 })
    }

    const body = await req.json()

    // O RLS policy "listings_insert" permitirá a inserção se seller_id = auth_id 
    const { error } = await supabase.from('marketplace_listings').insert({
      id: crypto.randomUUID(),
      title: body.title,
      price: body.price,
      condition: body.condition,
      images: [body.imageUrl],
      description: body.description,
      status: 'pending_review',
      seller_id: user.id, // ID real do Auth
      commission_rate: 0.1,
    } as any)

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
