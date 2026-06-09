import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { sendEmailMessage } from '@kings/notifications'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (admin.error) return admin.error

    const { listingId, productId, action } = await req.json()
    const id = listingId || productId // Aceita ambos para compatibilidade
    if (!id || !action) {
      return NextResponse.json({ error: 'Faltam parâmetros (listingId, action)' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Ação inválida. Use "approve" ou "reject"' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 3. Executar o UPDATE
    const newStatus = action === 'approve' ? 'active' : 'rejected'
    
    const { error } = await supabaseAdmin
      .from('marketplace_listings')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 4. Disparo de E-mail Transacional
    if (newStatus === 'active') {
      try {
        // Buscar o listing para pegar title e seller_id
        const { data: product } = await supabaseAdmin
          .from('marketplace_listings')
          .select('title, seller_id')
          .eq('id', id)
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

    // E-mail de rejeição
    if (newStatus === 'rejected') {
      try {
        const { data: listing } = await supabaseAdmin
          .from('marketplace_listings')
          .select('title, seller_id')
          .eq('id', id)
          .single()

        if (listing && listing.seller_id) {
          // Salvar motivo de rejeição se fornecido
          const { reason } = await req.json().catch(() => ({ reason: '' }))
          if (reason) {
            await supabaseAdmin
              .from('marketplace_listings')
              .update({ rejection_reason: reason })
              .eq('id', id)
          }

          const { data: sellerProfile } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', listing.seller_id)
            .single()

          if (sellerProfile && sellerProfile.email) {
            const MSU_URL = process.env.NEXT_PUBLIC_URL_MSU || 'https://kingssimuladores.com.br/usado'
            const html = `
<div style="font-family: Arial, sans-serif; background-color: #0A0A0A; padding: 40px 20px; color: #fff; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 30px;">
    <h1 style="color: #fff; margin-bottom: 20px;">Anúncio não aprovado</h1>
    <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Olá, <strong>${sellerProfile.full_name?.split(' ')[0] || 'Piloto'}</strong>. Infelizmente o seu anúncio <strong>${listing.title}</strong> não passou pela moderação da equipe.
    </p>
    ${reason ? `<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: left;">
      <strong style="color: #ef4444; font-size: 14px;">Motivo:</strong>
      <p style="color: #a1a1aa; margin: 8px 0 0; font-size: 14px;">${reason}</p>
    </div>` : ''}
    <p style="color: #71717a; font-size: 14px; margin-bottom: 30px;">
      Você pode corrigir os pontos acima e reenviar seu anúncio a qualquer momento.
    </p>
    <a href="${MSU_URL}/vender" style="display: inline-block; background-color: #E8002D; color: #fff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Criar Novo Anúncio
    </a>
  </div>
</div>`
            await sendEmailMessage({
              to: sellerProfile.email,
              subject: "Seu anúncio precisa de ajustes",
              html
            })
            console.log(`[Moderação] E-mail de rejeição enviado para ${sellerProfile.email}`)
          }
        }
      } catch (err) {
        console.error('[Moderação] Erro ao enviar email de rejeição:', err)
      }
    }

    return NextResponse.json({ success: true, newStatus })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
