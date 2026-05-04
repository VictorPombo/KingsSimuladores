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

    const { error } = await adminSupabase.from('products').insert({
      id: body.id || crypto.randomUUID(),
      title: body.title,
      price: body.price,
      // For used items, we can store condition and other specifics in attributes jsonb
      attributes: {
        condition: body.condition,
        brand_name: body.brand || null,
        model: body.model || null,
        has_original_box: body.has_original_box ?? false,
        has_usage_marks: body.has_usage_marks ?? false,
        city: body.city || null,
        state: body.state || null,
      },
      images: body.imageUrls || (body.imageUrl ? [body.imageUrl] : []),
      description: body.description,
      status: 'pending_review',
      seller_id: profile.id,
      category_id: body.category_id || null,
      // Default stock for used item is usually 1
      stock: 1,
      // Extract weight and dimensions if provided in shipping_options
      weight_kg: body.shipping_options?.weight || null,
      dimensions_cm: body.shipping_options ? {
        width: body.shipping_options.width,
        height: body.shipping_options.height,
        length: body.shipping_options.length
      } : null
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
