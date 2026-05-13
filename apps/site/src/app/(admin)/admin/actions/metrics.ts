'use server'

import { createServerSupabaseClient } from '@kings/db/server'

export async function getAdminMetrics() {
  const supabase = await createServerSupabaseClient()

  // 1. Total Customers
  const { count: customersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Total Orders and Revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, status, created_at')

  const paidOrders = orders?.filter((o: any) => o.status === 'paid' || o.status === 'shipped' || o.status === 'completed') || []
  const revenue = paidOrders.reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0)
  
  // 3. Valor em Estoque
  const { data: stockData } = await supabase
    .from('products')
    .select('price, stock')
    .eq('status', 'active')

  const stockValue = stockData?.reduce((acc: number, p: any) => acc + (p.price * (p.stock || 0)), 0) || 0

  // 4. Visitors (Hoje e últimos 30 dias)
  const { data: visitsData } = await supabase
    .rpc('get_visitas_por_dia', { dias: 30 })

  const visitsHoje = visitsData && visitsData.length > 0 ? Number(visitsData[visitsData.length - 1].unique_visits) : 0
  const totalVisitasMes = visitsData?.reduce((acc: number, day: any) => acc + Number(day.unique_visits), 0) || 0

  // 5. Top 5 Mais Vistos
  const { data: topProducts } = await supabase
    .from('products')
    .select('id, title, views, price, thumbnail')
    .order('views', { ascending: false })
    .limit(5)

  // 6. Funnel Data (Last 30 Days)
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const recentOrders = orders?.filter((o: any) => o.created_at >= thirtyDaysAgoIso) || []
  
  const abandonedCarts = recentOrders.filter((o: any) => ['draft', 'pending', 'checkout_started'].includes(o.status)).length
  const completedRecentOrders = recentOrders.filter((o: any) => ['paid', 'shipped', 'completed'].includes(o.status)).length

  return {
    customers: customersCount || 0,
    orders: paidOrders.length || 0,
    revenue: revenue || 0,
    stockValue: stockValue || 0,
    visits: {
      today: visitsHoje,
      last30Days: totalVisitasMes,
      chartData: visitsData || []
    },
    topProducts: topProducts || [],
    funnel: {
      visits: totalVisitasMes,
      abandonedCarts: abandonedCarts,
      completed: completedRecentOrders
    }
  }
}
