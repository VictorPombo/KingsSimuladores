import { createAdminClient } from '@kings/db'
import { ClientFinanceTable } from './ClientFinanceTable'

export const revalidate = 30 // Sempre em tempo real (sem cache)

export default async function AdminFinanceiroMSUPage() {
  const supabaseAdmin = createAdminClient()

  // 1. Busca os repasses com status 'available' e faz os Joins necessários
  const { data: payoutsData, error } = await supabaseAdmin
    .from('payouts')
    .select(`
      id, net_amount, seller_id, status, created_at,
      order_item:order_items( product:products(title) )
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Erro ao buscar contas a pagar do MSU:', error)
  }

  const payouts = payoutsData || []

  // 2. Busca os dados dos Vendedores (Nome, Email e PIX) para evitar erros de FK cruzada
  const sellerIds = [...new Set(payouts.map(p => p.seller_id).filter(Boolean))]
  
  let profiles: any[] = []
  if (sellerIds.length > 0) {
    const { data: profilesData } = await supabaseAdmin
      .from('profiles')
      .select('id, auth_id, full_name, email, pix_key')
      .in('id', sellerIds)
    
    if (profilesData) profiles = profilesData
  }

  // 3. Mescla tudo no Node.js
  const enrichedPayouts = payouts.map(payout => {
    const seller = profiles.find(p => p.id === payout.seller_id || p.auth_id === payout.seller_id)
    return {
      ...payout,
      seller: seller || null
    }
  })

  return (
    <div style={{ padding: '2rem', background: '#0A0A0A', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E8002D', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
          ADMIN / MSU / FINANCEIRO
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff', letterSpacing: '-1px' }}>
          Contas a Pagar (Repasses MSU)
        </h1>
        <p style={{ color: '#a1a1aa', marginBottom: '3rem', fontSize: '1.1rem' }}>
          Estes são os valores já liberados e disponíveis. Efetue os PIXs para as chaves informadas e dê baixa no sistema para finalizar a transação e pagar os vendedores.
        </p>

        <ClientFinanceTable initialPayouts={enrichedPayouts} />
      </div>
    </div>
  )
}
