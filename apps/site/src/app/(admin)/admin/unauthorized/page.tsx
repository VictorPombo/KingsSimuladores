import { Card, Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'

export const dynamic = 'force-dynamic'

export default async function UnauthorizedPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  let errorMessage = ''
  
  if (user) {
    const { data, error } = await supabase.from('profiles').select('*').eq('auth_id', user.id).single()
    profile = data
    if (error) errorMessage = error.message
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="400px">
        <Card glow>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '3rem' }}>🚫</div>
            <h1 style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 800 }}>Acesso Negado</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Seu usuário não tem permissão de administrador.
            </p>
            
            <div style={{ background: '#181a20', padding: '16px', borderRadius: '8px', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8', marginTop: '16px' }}>
              <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: '8px' }}>DIAGNÓSTICO DO SERVIDOR:</div>
              <div><strong>Email atual:</strong> {user ? user.email : 'Nenhum usuário logado'}</div>
              <div><strong>ID do User:</strong> {user ? user.id : 'N/A'}</div>
              <div><strong>Role no BD:</strong> {profile ? profile.role : 'Perfil não encontrado'}</div>
              {errorMessage && <div style={{ color: '#ef4444', marginTop: '8px' }}><strong>Erro BD:</strong> {errorMessage}</div>}
            </div>

            <a href="/admin/login" style={{ color: '#06d6a0', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', marginTop: '8px', display: 'inline-block' }}>
              &larr; Tentar fazer login novamente
            </a>
          </div>
        </Card>
      </Container>
    </div>
  )
}
