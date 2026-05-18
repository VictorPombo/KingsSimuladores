import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function MarcasPage() {
  const supabase = await createServerSupabaseClient()
  const { data: brands } = await supabase.from('brands').select('*').order('name')

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Marcas</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Marcas cadastradas no hub</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {(brands || []).map((b: any) => (
            <div key={b.id} style={{
              background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d',
              padding: '24px', transition: 'border-color 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #3f424d' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                    {b.name[0]}
                  </div>
                )}
                <div>
                  <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{b.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>/{b.slug}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <div><span style={{ color: '#64748b' }}>CNPJ:</span> <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{b.cnpj || '-'}</span></div>
                <div><span style={{ color: '#64748b' }}>Escopo:</span> <span style={{ color: '#94a3b8' }}>{b.slug}</span></div>
              </div>
            </div>
          ))}
          {(!brands || brands.length === 0) && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
              Nenhuma marca cadastrada.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
