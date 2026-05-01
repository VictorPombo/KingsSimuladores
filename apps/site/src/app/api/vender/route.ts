import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil do vendedor não encontrado' }, { status: 404 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase.from('marketplace_listings').insert({
      id: crypto.randomUUID(),
      title: body.title,
      price: body.price,
      condition: body.condition,
      images: body.imageUrls || (body.imageUrl ? [body.imageUrl] : []),
      description: body.description,
      brand: body.brand || null,
      model: body.model || null,
      city: body.city || null,
      state: body.state || null,
      has_original_box: body.has_original_box ?? false,
      has_usage_marks: body.has_usage_marks ?? false,
      shipping_options: body.shipping_options || null,
      status: 'pending_review',
      seller_id: profile.id,
      commission_rate: 0.15,
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
