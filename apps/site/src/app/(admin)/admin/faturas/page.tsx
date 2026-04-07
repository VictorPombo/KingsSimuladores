import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function FaturasPage() {
  const supabase = await createServerSupabaseClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, status, created_at, payment_method')
    .in('status', ['paid', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(50)

  const totalFaturado = (orders || []).reduce((a: number, o: any) => a + Number(o.total), 0)

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Faturas</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Histórico de cobranças e recebimentos</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Total Faturado</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '6px', fontFamily: 'monospace' }}>R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Pedidos Pagos</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '6px' }}>{(orders || []).length}</div>
          </div>
        </div>

        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead><tr>
                {['Pedido', 'Valor', 'Pagamento', 'Status', 'Data'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(!orders || orders.length === 0) ? (
                  <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Nenhuma fatura registrada.</td></tr>
                ) : orders.map((o: any) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    paid: { label: 'Pago', color: '#10b981' },
                    shipped: { label: 'Enviado', color: '#3b82f6' },
                    delivered: { label: 'Entregue', color: '#22d3ee' },
                  }
                  const s = statusMap[o.status] || { label: o.status, color: '#94a3b8' }
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #3f424d' }}
                      onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0' }}>#{o.id.slice(0, 8)}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>R$ {Number(o.total).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'capitalize' }}>{o.payment_method || 'N/A'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: s.color + '18', color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
