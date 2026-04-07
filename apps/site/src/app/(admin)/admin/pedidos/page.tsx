import { Container, Badge, Card } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'

export default async function AdminPedidosPage() {
  const supabase = await createServerSupabaseClient()
  
  // Exemplo: Buscar pedidos com o profile relacionado
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      brand_origin,
      status,
      total,
      created_at,
      profiles (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Gestão de Pedidos</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize e gerencie todos os pedidos Kings e MSU.</p>
      </header>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
           <input type="text" placeholder="Buscar pedido..." style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#fff', outline: 'none' }} />
           <select style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#fff', outline: 'none' }}>
             <option value="">Todos os Status</option>
             <option value="pending">Pendente (pending)</option>
             <option value="paid">Pago (paid)</option>
           </select>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>ID do Pedido</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Data</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Cliente</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Marca</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {error || !orders || orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {error ? 'Erro ao carregar pedidos.' : 'Nenhum pedido encontrado.'}
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {order.id.split('-')[0]}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ color: '#fff', fontWeight: 500 }}>{order.profiles?.full_name || 'Desconhecido'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{order.profiles?.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {order.brand_origin === 'kings' ? (
                      <Badge variant="info">KINGS</Badge>
                    ) : (
                      <Badge variant="warning">MSU</Badge>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--success)', fontWeight: 600 }}>
                    {formatPrice(order.total)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <Badge variant={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'info'}>
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
