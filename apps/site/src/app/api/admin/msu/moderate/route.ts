import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { createServerSupabaseClient } from '@kings/db/server'
import { sendEmailMessage } from '@kings/notifications'

export async function POST(req: Request) {
  try {
    const { productId, action } = await req.json()
    if (!productId || !action) {
      return NextResponse.json({ error: 'Faltam parâmetros (productId, action)' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Ação inválida. Use "approve" ou "reject"' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const supabaseAdmin = createAdminClient()

    // 1. Validar Sessão
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Checagem de privilégios de Admin
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('auth_id', user.id).single()
    
    // Suportando a possível estrutura de 'role' do projeto
    if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
       return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem moderar anúncios.' }, { status: 403 })
    }

    // 3. Executar o UPDATE
    const newStatus = action === 'approve' ? 'active' : 'rejected'
    
    const { error } = await supabaseAdmin
      .from('products')
      .update({ status: newStatus })
      .eq('id', productId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 4. Disparo de E-mail Transacional
    if (newStatus === 'active') {
      try {
        // Buscar o produto para pegar title e seller_id
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('title, seller_id')
          .eq('id', productId)
          .single()

        if (product && product.seller_id) {
          // Buscar o email do seller (seller_id aponta para profiles.id)
          const { data: sellerProfile } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', product.seller_id)
            .single()

          if (sellerProfile && sellerProfile.email) {
            const MSU_URL = process.env.NEXT_PUBLIC_URL_MSU || 'https://kingssimuladores.com.br/usado'
            const html = `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 30px;">
    <h1 style="color: #fff; margin-bottom: 20px;">Anúncio Aprovado! 🏎️</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Boas notícias, <strong>${sellerProfile.full_name?.split(' ')[0] || 'Piloto'}</strong>! O seu equipamento <strong>${product.title}</strong> passou pela moderação da equipe Kings Simuladores e já está ativo na nossa vitrine. Agora é só aguardar o próximo piloto levar ele para a garagem.
    </p>
    <a href="${MSU_URL}/dashboard" style="display: inline-block; background-color: #E8002D; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Ver Meu Painel
    </a>
  </div>
</div>`
            
            await sendEmailMessage({
              to: sellerProfile.email,
              subject: "Seu anúncio está no ar! 🏎️",
              html
            })
            console.log(`[Moderação] E-mail de aprovação enviado para ${sellerProfile.email}`)
          }
        }
      } catch (err) {
        console.error('[Moderação] Erro ao enviar email de aprovação:', err)
      }
    }

    return NextResponse.json({ success: true, newStatus })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
