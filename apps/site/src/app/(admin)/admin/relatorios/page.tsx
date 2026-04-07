import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RelatoriosAdminPage() {
  const supabase = await createServerSupabaseClient()

  // 1. Verificar Permissão de Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    redirect('/admin/unauthorized')
  }

  // 2. Fetch Dados Analíticos
  const { data: orders } = await supabase
    .from('orders')
    .select('brand_origin, total, shipping_cost, created_at, status')
    // Apenas pedidos fechados/aprovados para relatórios consistentes
    .in('status', ['paid', 'shipped', 'delivered'])

  const allOrders = orders || []
  
  // Marketshare
  const kingsOrders = allOrders.filter(o => o.brand_origin === 'kings')
  const msuOrders = allOrders.filter(o => o.brand_origin === 'msu')
  
  // Faturamento
  const totalKings = kingsOrders.reduce((acc, curr) => acc + curr.total, 0)
  const totalMSU = msuOrders.reduce((acc, curr) => acc + curr.total, 0)
  const fatGlobal = totalKings + totalMSU

  // Frete Arrecadado
  const freteGlobal = allOrders.reduce((acc, curr) => acc + (curr.shipping_cost || 0), 0)

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#0a0d14' }}>
      <h1 className="text-3xl font-orbitron font-bold text-cyan-400 mb-2">Relatórios Globais</h1>
      <p className="text-gray-400 mb-8">Estatísticas Vitais do Hub (Kings e Meu Simulador Usado).</p>

      {/* KPI Global Faturamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-lg border border-gray-800 bg-gradient-to-br from-[#111827] to-[#1e293b]">
          <h3 className="text-sm text-gray-400 font-semibold mb-1">Faturamento Consolidado</h3>
          <p className="text-4xl font-bold font-mono text-white">
            R$ {fatGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-cyan-500 mt-2">Soma bruta de todo o fluxo monetário aprovado.</p>
        </div>
        <div className="p-6 rounded-lg border border-gray-800 bg-[#111827]">
          <h3 className="text-sm text-gray-400 font-semibold mb-1">Volume de Pedidos (Unid.)</h3>
          <p className="text-4xl font-bold font-mono text-cyan-400">
            {allOrders.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Pacotes entregues ou sendo processados.</p>
        </div>
        <div className="p-6 rounded-lg border border-gray-800 bg-[#111827]">
          <h3 className="text-sm text-gray-400 font-semibold mb-1">Arrecadação de Frete</h3>
          <p className="text-4xl font-bold font-mono text-blue-400">
            R$ {freteGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Capital que rodou via Melhor Envio.</p>
        </div>
      </div>

      {/* Split de Marcas */}
      <h2 className="text-xl font-orbitron font-semibold text-white mb-4 border-b border-gray-800 pb-2">Marketshare das Marcas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-lg border-l-4 border-cyan-500 bg-[#1f2937]/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-orbitron">⚜️ Kings Simuladores</h3>
            <span className="px-3 py-1 bg-cyan-900/50 text-cyan-400 rounded-full text-xs font-bold">{kingsOrders.length} Pedidos</span>
          </div>
          <p className="text-3xl font-mono mb-2">R$ {totalKings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full" style={{ width: `${(totalKings / (fatGlobal || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="p-6 rounded-lg border-l-4 border-green-500 bg-[#1f2937]/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-orbitron">🏎️ Meu Simulador Usado</h3>
            <span className="px-3 py-1 bg-green-900/50 text-green-400 rounded-full text-xs font-bold">{msuOrders.length} Pedidos</span>
          </div>
          <p className="text-3xl font-mono mb-2">R$ {totalMSU.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${(totalMSU / (fatGlobal || 1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  )
}
