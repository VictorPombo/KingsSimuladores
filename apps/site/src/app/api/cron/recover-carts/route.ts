import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'
import { sendWhatsappMessage, sendEmailMessage } from '@kings/notifications'

// Next.js: Garantir que não fica em cache
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // 1. Validar autenticação do Vercel Cron
  // Em produção a Vercel envia o CRON_SECRET no Header Authorization
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // 2. Definir marcos de tempo
  const now = Date.now()
  const oneHourAgo = new Date(now - 1 * 60 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const fortyEightHoursAgo = new Date(now - 48 * 60 * 60 * 1000).toISOString()
  // Limite pra não engatilhar carrinhos mortos há meses
  const threeDaysAgo = new Date(now - 72 * 60 * 60 * 1000).toISOString()

  let recoveredCount = 0

  // ----------------------------------------------------
  // FASE 1: WHATSAPP (1 HORA)
  // Pegamos carrinhos velhos de > 1h mas mais novos que 24h
  // ----------------------------------------------------
  const { data: carts1h } = await supabase
    .from('cart')
    .select('id, customer_id, brand, items, wpp_1h_sent')
    .eq('wpp_1h_sent', false)
    .lt('updated_at', oneHourAgo)
    .gt('updated_at', twentyFourHoursAgo)

  if (carts1h) {
    for (const cart of carts1h) {
      if (Array.isArray(cart.items) && cart.items.length > 0) {
        const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('id', cart.customer_id).single()
        
        if (profile?.phone) {
          const brandName = cart.brand === 'kings' ? 'Kings Simuladores' : 'Meu Simulador Usado'
          const firstName = profile.full_name?.split(' ')[0] || 'piloto'
          
          await sendWhatsappMessage({
            phone: profile.phone,
            message: `🏎️ Opa *${firstName}*, tudo acelerando?\n\nVimos que você esqueceu alguns itens no seu carrinho lá na ${brandName}.\n\nSe der algum erro no pagamento ou precisar de ajuda, é só chamar a gente aqui: https://kingssimuladores.com.br/checkout`
          })
          
          await supabase.from('cart').update({ wpp_1h_sent: true }).eq('id', cart.id)
          recoveredCount++
        }
      }
    }
  }

  // ----------------------------------------------------
  // FASE 2: E-MAIL (24 HORAS)
  // ----------------------------------------------------
  const { data: carts24h } = await supabase
    .from('cart')
    .select('id, customer_id, brand, items')
    .eq('email_24h_sent', false)
    .lt('updated_at', twentyFourHoursAgo)
    .gt('updated_at', fortyEightHoursAgo)

  if (carts24h) {
    for (const cart of carts24h) {
      if (Array.isArray(cart.items) && cart.items.length > 0) {
        const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', cart.customer_id).single()
        
        if (profile?.email) {
          const brandName = cart.brand === 'kings' ? 'Kings Simuladores' : 'Meu Simulador Usado'
          const firstName = profile.full_name?.split(' ')[0] || 'Piloto'
          
          await sendEmailMessage({
            to: profile.email,
            subject: `Seus equipamentos da ${brandName} estão esperando por você! 🚦`,
            html: `
              <h2>Aperte os cintos, ${firstName}!</h2>
              <p>Notamos que você selecionou produtos incríveis, mas ainda não acelerou pro grid de largada.</p>
              <p>Nossos estoques são dinâmicos. Volte e garanta seus produtos antes que esgotem!</p>
              <p><a href="https://kingssimuladores.com.br/checkout"><strong>FINALIZAR COMPRA AGORA</strong></a></p>
            `
          })
          
          await supabase.from('cart').update({ email_24h_sent: true }).eq('id', cart.id)
          recoveredCount++
        }
      }
    }
  }

  // ----------------------------------------------------
  // FASE 3: E-MAIL + CUPOM LAST CHANCE (48 HORAS)
  // ----------------------------------------------------
  const { data: carts48h } = await supabase
    .from('cart')
    .select('id, customer_id, brand, items')
    .eq('email_48h_sent', false)
    .lt('updated_at', fortyEightHoursAgo)
    .gt('updated_at', threeDaysAgo)

  if (carts48h) {
    // Apenas marcamos como mandado e disparamos um email com cupom de 5% de desconto final
    for (const cart of carts48h) {
      if (Array.isArray(cart.items) && cart.items.length > 0) {
        const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', cart.customer_id).single()
        
        if (profile?.email) {
          const firstName = profile.full_name?.split(' ')[0] || 'Piloto'
          const cupomName = 'VOLTA5'
          
          await sendEmailMessage({
            to: profile.email,
            subject: `ÚLTIMA CHANCE: 5% Extra pra você fechar agora! 🏁`,
            html: `
              <h2>Seu setup dos sonhos mais perto, ${firstName}!</h2>
              <p>Liberei um desconto especial para você voltar pro cockpit agora mesmo.</p>
              <p>Aplique o código <strong>${cupomName}</strong> no carrinho e finalize sua montagem!</p>
              <p><a href="https://kingssimuladores.com.br/checkout"><strong>IR PARA O CHECKOUT</strong></a></p>
            `
          })
          
          await supabase.from('cart').update({ email_48h_sent: true }).eq('id', cart.id)
          recoveredCount++
        }
      }
    }
  }

  return NextResponse.json({ success: true, messages_sent: recoveredCount })
}
