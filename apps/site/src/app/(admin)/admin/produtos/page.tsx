import { Container, Badge, Card, Button } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'

export default async function AdminProdutosPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>Gestão de Produtos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Inventário da Kings Store.</p>
        </div>
        <Button>+ Novo Produto</Button>
      </header>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Foto</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Nome / Modelo</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Marca</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Preço</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Estoque</th>
            </tr>
          </thead>
          <tbody>
            {error || !products || products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {error ? 'Erro ao carregar produtos.' : 'Nenhum produto cadastrado.'}
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>S/FOTO</div>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 500 }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {p.brand_id}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--success)', fontWeight: 600 }}>
                    {formatPrice(p.price)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: p.stock_quantity > 0 ? '#fff' : 'var(--danger)' }}>{p.stock_quantity} un</span>
                      {p.stock_quantity === 0 && <Badge variant="danger">Esgotado</Badge>}
                    </div>
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
