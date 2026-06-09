import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'
import { createAdminClient } from '@kings/db'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Validações dos campos obrigatórios
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length < 3) {
      return NextResponse.json({ error: 'Título inválido (mínimo 3 caracteres)' }, { status: 422 })
    }
    if (!body.price || isNaN(Number(body.price)) || Number(body.price) <= 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 422 })
    }
    if (!Array.isArray(body.imageUrls) || body.imageUrls.length === 0) {
      return NextResponse.json({ error: 'Pelo menos uma imagem é obrigatória' }, { status: 422 })
    }
    if (!body.brand || !body.model) {
      return NextResponse.json({ error: 'Marca e modelo são obrigatórios' }, { status: 422 })
    }

    // Buscar profile do vendedor
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil do vendedor não encontrado' }, { status: 404 })
    }

    // Validar condition (enum: like_new, good, fair)
    const validConditions = ['like_new', 'good', 'fair']
    const condition = validConditions.includes(body.condition) ? body.condition : 'good'

    const adminSupabase = createAdminClient()

    // INSERT na tabela CORRETA: marketplace_listings (NÃO products!)
    const { data: listing, error } = await adminSupabase.from('marketplace_listings').insert({
      seller_id: profile.id,
      title: body.title.trim(),
      description: body.description || null,
      price: Number(body.price),
      condition,
      status: 'pending_review', // Enum válido em marketplace_listings
      images: body.imageUrls,
      commission_rate: 15, // Taxa padrão 15%
      category_id: body.category_id || null,
      brand: body.brand.trim(),
      model: body.model.trim(),
      city: body.city || null,
      state: body.state || null,
      has_original_box: body.has_original_box ?? false,
      has_usage_marks: body.has_usage_marks ?? false,
      shipping_options: body.shipping_options ? {
        weight: body.shipping_options.weight,
        width: body.shipping_options.width,
        height: body.shipping_options.height,
        length: body.shipping_options.length,
        zip_origin: body.shipping_options.zip_origin
      } : null,
    }).select('id').single()

    if (error) {
      console.error('[vender/route] Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // E-mail de confirmação: "Recebemos seu anúncio"
    try {
      const { sendEmailMessage } = await import('@kings/notifications')
      const { data: sellerProfile } = await adminSupabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', profile.id)
        .single()

      if (sellerProfile?.email) {
        const MSU_URL = process.env.NEXT_PUBLIC_URL_MSU || 'https://kingssimuladores.com.br/usado'
        await sendEmailMessage({
          to: sellerProfile.email,
          subject: '📋 Anúncio recebido! Estamos analisando.',
          html: `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 30px;">
    <h1 style="color: #fff; margin-bottom: 20px;">Anúncio recebido! 📋</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Olá, <strong>${sellerProfile.full_name?.split(' ')[0] || 'Piloto'}</strong>! Recebemos o anúncio do seu equipamento <strong>${body.title}</strong> e ele está em análise pela nossa equipe.
    </p>
    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <p style="color: #f59e0b; font-size: 14px; margin: 0; font-weight: 600;">⏳ Prazo de análise: até 24 horas úteis</p>
    </div>
    <p style="color: #71717a; font-size: 14px; margin-bottom: 30px;">
      Você receberá um e-mail assim que o anúncio for aprovado ou se precisarmos de algum ajuste.
    </p>
    <a href="${MSU_URL}/dashboard?tab=ads" style="display: inline-block; background-color: #E8002D; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Acompanhar no Painel
    </a>
  </div>
</div>`
        })
        console.log(`[vender/route] Email de confirmação enviado para ${sellerProfile.email}`)
      }
    } catch (emailErr) {
      console.error('[vender/route] Falha ao enviar email de confirmação:', emailErr)
    }

    return NextResponse.json({ success: true, listingId: listing?.id })
  } catch (err: any) {
    console.error('[vender/route] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
