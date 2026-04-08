import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Precisamos do client com auth para identificar o usuário, mas vamos usar service_role ou auth client
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const { error } = await supabase.from('marketplace_listings').insert({
      id: crypto.randomUUID(),
      title: body.title,
      price: body.price,
      condition: body.condition,
      images: [body.imageUrl],
      description: body.description,
      status: 'pending_review',
      seller_id: user.id,
      commission_rate: 0.1,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
