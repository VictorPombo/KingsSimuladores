import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, auth_id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const admins = (profiles || []).filter((p: any) => p.role === 'admin')
  const total = (profiles || []).length

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Usuários</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Administradores e permissões de acesso</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Total Usuários</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>{total}</div>
          </div>
          <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Administradores</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#8b5cf6', marginTop: '6px' }}>{admins.length}</div>
          </div>
        </div>

        <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead><tr>
                {['Nome', 'E-mail', 'Função', 'Cadastrado em'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(!profiles || profiles.length === 0) ? (
                  <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Nenhum usuário encontrado.</td></tr>
                ) : profiles.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #3f424d' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: p.role === 'admin' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#3f424d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>{(p.full_name || '?')[0].toUpperCase()}</div>
                        <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>{p.full_name || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.82rem' }}>{p.email || '-'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold',
                        background: p.role === 'admin' ? '#8b5cf618' : '#3b82f618',
                        color: p.role === 'admin' ? '#8b5cf6' : '#3b82f6',
                        border: `1px solid ${p.role === 'admin' ? '#8b5cf630' : '#3b82f630'}`
                      }}>{p.role === 'admin' ? 'Admin' : 'Cliente'}</span>
                    </td>
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
