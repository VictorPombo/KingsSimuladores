import { createServerSupabaseClient } from '@kings/db/server'
import { DiarioDeBordoClient } from './DiarioDeBordoClient'

export const dynamic = 'force-dynamic'

export default async function DiarioDeBordoPage() {
  const supabase = await createServerSupabaseClient()

  // Buscar todos os pedidos pagos dos últimos 12 meses
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const { data: orders } = await supabase
    .from('orders')
    .select('total, subtotal, shipping_cost, status, payment_method, created_at')
    .eq('brand_origin', 'kings')
    .gte('created_at', twelveMonthsAgo.toISOString())

  const allOrders = (orders || []) as any[]

  // Agrupar faturamento por mês
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  const now = new Date()
  const faturamentoByMonth: Record<string, { faturamento: number; produtos: number; envio: number; aprovados: number; cancelados: number }> = {}
  
  // Inicializar últimos 12 meses
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthNames[d.getMonth()]
    faturamentoByMonth[key] = { faturamento: 0, produtos: 0, envio: 0, aprovados: 0, cancelados: 0 }
  }

  allOrders.forEach(o => {
    const d = new Date(o.created_at)
    const key = monthNames[d.getMonth()]
    if (!faturamentoByMonth[key]) return

    if (['paid', 'shipped', 'delivered'].includes(o.status)) {
      faturamentoByMonth[key].faturamento += Number(o.total || 0)
      faturamentoByMonth[key].produtos += Number(o.subtotal || 0)
      faturamentoByMonth[key].envio += Number(o.shipping_cost || 0)
      faturamentoByMonth[key].aprovados++
    } else if (o.status === 'cancelled') {
      faturamentoByMonth[key].cancelados++
    }
  })

  const dataFaturamento = Object.entries(faturamentoByMonth).map(([name, v]) => ({
    name,
    Faturamento: v.faturamento,
    Produtos: v.produtos,
    Envio: v.envio,
  }))

  const dataPedidos = Object.entries(faturamentoByMonth).map(([name, v]) => ({
    name,
    Aprovados: v.aprovados,
    Cancelados: v.cancelados,
  }))

  const dataTicket = Object.entries(faturamentoByMonth).map(([name, v]) => ({
    name,
    Ticket: v.aprovados > 0 ? v.faturamento / v.aprovados : 0,
  }))

  // Agrupar formas de pagamento dos últimos 30 dias
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentOrders = allOrders.filter(o => new Date(o.created_at) >= thirtyDaysAgo && ['paid', 'shipped', 'delivered'].includes(o.status))

  const paymentCounts: Record<string, number> = {}
  recentOrders.forEach(o => {
    const method = o.payment_method || 'Não informado'
    paymentCounts[method] = (paymentCounts[method] || 0) + 1
  })

  const dataPiePagamento = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }))
  if (dataPiePagamento.length === 0) {
    dataPiePagamento.push({ name: 'Sem dados', value: 1 })
  }

  // Faturamento 30 dias
  const fat30 = recentOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const fatMedioDia = recentOrders.length > 0 ? fat30 / 30 : 0

  // Produtos ativos
  const { count: produtosAtivos } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #2a2d3d' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kings Simuladores
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Atualizado em {new Date().toLocaleDateString('pt-BR')} — Dados reais do banco de dados
          </div>
        </div>
      </header>

      <DiarioDeBordoClient 
        dataFaturamento={dataFaturamento}
        dataPedidos={dataPedidos}
        dataTicket={dataTicket}
        dataPiePagamento={dataPiePagamento}
        fat30={fat30}
        fatMedioDia={fatMedioDia}
        produtosAtivos={produtosAtivos || 0}
      />
    </div>
  )
}
