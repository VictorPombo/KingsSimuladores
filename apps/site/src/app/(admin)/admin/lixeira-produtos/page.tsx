import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function LixeiraProdutosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, title, sku, price, stock, status, created_at')
    .eq('status', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Lixeira de Produtos</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Produtos arquivados que podem ser restaurados</p>
        </div>

        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr>
                  {['Produto', 'SKU', 'Preço', 'Estoque', 'Arquivado em'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!products || products.length === 0) ? (
                  <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    🗑️ A lixeira está vazia. Produtos arquivados aparecerão aqui.
                  </td></tr>
                ) : products.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #3f424d', opacity: 0.7 }}
                    onMouseEnter={(e: any) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.7' }}>
                    <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '0.85rem' }}>{p.title}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>{p.sku || '-'}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8' }}>R$ {Number(p.price).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>{p.stock} un.</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
