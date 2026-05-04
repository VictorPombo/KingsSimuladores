import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@kings/db/server'
import { markCommissionPaid, updateCommissionRate } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 30

export default async function ComissoesAdminPage() {
  const supabase = await createServerSupabaseClient()

  // 1. Verificar Permissão de Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('auth_id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    redirect('/admin/unauthorized')
  }

  // 2. Resgatar Tabela de Comissões
  // Join com profiles para saber QUEM é o vendedor
  // Join com orders para saber qual pedido gerou o Split
  const { data: commissions, error } = await supabase
    .from('commissions')
    .select(`
      id,
      sale_amount,
      commission_rate,
      commission_amount,
      seller_payout,
      payout_status,
      paid_at,
      created_at,
      order_id,
      orders ( id, status ),
      seller_id,
      profiles!seller_id ( full_name, email )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar sub-ledgers:', error)
  }

  const pendentes = commissions?.filter(c => c.payout_status === 'pending') || []
  const pagas = commissions?.filter(c => c.payout_status === 'paid') || []

  const totalRetidoKings = pendentes.reduce((acc, curr) => acc + curr.commission_amount, 0)
  const totalDevidoVendedores = pendentes.reduce((acc, curr) => acc + curr.seller_payout, 0)

  // 3. Resgatar Taxa de Comissão Atual
  const { data: currentRateData } = await supabase.from('platform_settings').select('value').eq('key', 'msu_commission_rate').single()
  const currentRateDecimal = currentRateData?.value ? parseFloat(currentRateData.value) : 0.13
  const currentRatePercentage = (currentRateDecimal * 100).toFixed(0) // ex: 13

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#0a0d14' }}>
      <h1 className="text-3xl font-orbitron font-bold text-yellow-400 mb-2">Gestão de Comissões (MSU Split)</h1>
      <p className="text-gray-400 mb-8">Administração do Sub-Ledger financeiro e prestação de contas de terceiros.</p>

      {/* Edição da Taxa de Comissão */}
      <div className="bg-[#111827] border border-gray-800 rounded-lg p-6 mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h3 className="text-lg text-white font-semibold mb-1">Taxa de Corretagem da Plataforma</h3>
          <p className="text-sm text-gray-500">
            Esta é a porcentagem cobrada sobre as vendas do Meu Simulador Usado. 
            Atualize para ajustar o valor que será retido pela KingsHub.
          </p>
        </div>
        <form action={updateCommissionRate} className="flex gap-3">
          <div className="relative">
            <input 
              type="number" 
              name="commission_rate" 
              defaultValue={currentRatePercentage}
              min="0" max="100" step="1" required
              className="bg-gray-800 border border-gray-700 text-white text-lg font-mono rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-24 p-2.5 text-center" 
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">%</span>
          </div>
          <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            Salvar
          </button>
        </form>
      </div>

      {/* Cards Analíticos de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-lg border border-cyan-800 bg-[#111827]">
          <h3 className="text-sm text-cyan-400 font-semibold mb-1">Lucro Retido (KingsHub)</h3>
          <p className="text-3xl font-bold font-mono">
            R$ {totalRetidoKings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Corretagem pura aguardando clareira bancária.</p>
        </div>
        <div className="p-6 rounded-lg border border-red-800 bg-[#111827]">
          <h3 className="text-sm text-red-400 font-semibold mb-1">Dívida de Repasse (Vendedores)</h3>
          <p className="text-3xl font-bold font-mono text-red-500">
            R$ {totalDevidoVendedores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Valor que deve ser depositado nas chaves PIX dos parceiros.</p>
        </div>
      </div>

      <h2 className="text-xl font-orbitron font-semibold text-yellow-500 mb-4 border-b border-gray-800 pb-2">Repasses Pendentes ({pendentes.length})</h2>
      
      {pendentes.length > 0 ? (
        <div className="overflow-x-auto bg-[#1f2937] border border-gray-700 rounded-lg mb-10">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#111827] text-gray-400">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Pedido (Status)</th>
                <th className="px-4 py-3 text-right">Preço Venda</th>
                <th className="px-4 py-3 text-right text-cyan-400">Taxa (Kings)</th>
                <th className="px-4 py-3 text-right text-red-400">A Repassar</th>
                <th className="px-4 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pendentes.map((c: any) => (
                <tr key={c.id} className="border-t border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 font-semibold">{c.profiles?.full_name}</td>
                  <td className="px-4 py-3">#{c.order_id.split('-')[0]} ({c.orders?.status})</td>
                  <td className="px-4 py-3 text-right font-mono">R$ {c.sale_amount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-cyan-400">R$ {c.commission_amount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">R$ {c.seller_payout?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <form action={markCommissionPaid}>
                      <input type="hidden" name="commission_id" value={c.id} />
                      <button type="submit" className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-semibold rounded text-xs">
                        💰 Marcar Pago
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic mb-10">Não há repasses atrasados.</p>
      )}

      {/* Tabela de Pagos */}
      <h2 className="text-xl font-orbitron font-semibold text-green-500 mb-4 border-b border-gray-800 pb-2">Repasses Efetivados ({pagas.length})</h2>
      {pagas.length > 0 ? (
        <div className="overflow-x-auto bg-[#1f2937]/50 border border-gray-800 rounded-lg">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#111827] text-gray-500">
              <tr>
                <th className="px-4 py-3">Pagamento Efetivado</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3 text-right">Sua Corretagem</th>
                <th className="px-4 py-3 text-right">Repasse Depositado</th>
              </tr>
            </thead>
            <tbody>
              {pagas.map((c: any) => (
                <tr key={c.id} className="border-t border-gray-800">
                  <td className="px-4 py-3 text-green-400">{new Date(c.paid_at).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3">{c.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-right font-mono">R$ {c.commission_amount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono">R$ {c.seller_payout?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic mb-10">O histórico de pagamentos está vazio.</p>
      )}
    </div>
  )
}
