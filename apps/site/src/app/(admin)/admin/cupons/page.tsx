import { createServerSupabaseClient } from '@kings/db/server'
import { createCoupon, toggleCouponStatus, deleteCoupon } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const supabase = await createServerSupabaseClient()

  // Com policy RLS do admin, apenas administradores conseguirão ler isso.
  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Erro ao carregar cupons: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 font-rajdhani">Gestão de Cupons</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-cyan-400">Criar Novo Cupom</h2>
          <form action={async (formData) => { "use server"; await createCoupon(formData); }} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Código</label>
              <input name="code" type="text" required placeholder="BEMVINDO10" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm uppercase" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Tipo</label>
                <select name="type" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm">
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Fixo (R$)</option>
                  <option value="shipping">Frete Grátis</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Valor</label>
                <input name="value" type="number" step="0.01" required placeholder="10.00" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Abrangência</label>
              <select name="brand_scope" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm">
                <option value="all">Todas as Lojas (Misto)</option>
                <option value="kings">Apenas Kings Simuladores</option>
                <option value="msu">Apenas Meu Simulador Usado</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Validade (Opcional)</label>
                <input name="expires_at" type="date" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-400" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Limite (Opcional)</label>
                <input name="usage_limit" type="number" placeholder="Ex: 50" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <button type="submit" className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded py-2 text-sm transition-colors">
              Adicionar Cupom
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-0 overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Regra</th>
                <th className="px-4 py-3 font-medium">Uso</th>
                <th className="px-4 py-3 font-medium">Escopo</th>
                <th className="px-4 py-3 font-medium">Status / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {coupons?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhum cupom cadastrado.</td>
                </tr>
              ) : coupons?.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <span className="font-mono text-cyan-400 font-semibold text-xs tracking-wider border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 rounded">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {coupon.type === 'percent' && `${coupon.value}% off`}
                    {coupon.type === 'fixed' && `R$ ${coupon.value.toFixed(2)} off`}
                    {coupon.type === 'shipping' && <span className="text-purple-400">Frete Grátis</span>}
                    {coupon.expires_at && <div className="text-[10px] text-slate-500 mt-1">Vence: {new Date(coupon.expires_at).toLocaleDateString('pt-BR')}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full" 
                          style={{ width: coupon.usage_limit ? `${Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100)}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        {coupon.usage_count} {coupon.usage_limit && `/ ${coupon.usage_limit}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {coupon.brand_scope === 'kings' && <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Kings</span>}
                    {coupon.brand_scope === 'msu' && <span className="text-xs bg-purple-900/40 border border-purple-500/20 px-2 py-0.5 rounded text-purple-300">MSU</span>}
                    {!coupon.brand_scope && <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Misto</span>}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <form action={async () => { "use server"; await toggleCouponStatus(coupon.id, coupon.is_active); }}>
                      <button 
                        type="submit" 
                        className={`text-xs px-2 py-1 rounded ${coupon.is_active ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                      >
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </form>
                    <form action={async () => { "use server"; await deleteCoupon(coupon.id); }}>
                      <button 
                        type="submit" 
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Deletar"
                      >
                       🗑️
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
