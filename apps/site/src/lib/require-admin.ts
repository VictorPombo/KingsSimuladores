/**
 * requireAdmin — Helper de autenticação para API Routes do painel admin.
 *
 * Usa cookies de sessão (Supabase SSR) para identificar o usuário
 * e verifica se o profile tem role === 'admin'.
 *
 * Uso:
 *   const admin = await requireAdmin()
 *   if (admin.error) return admin.error  // NextResponse 401/403
 *   // admin.profileId está disponível
 */
import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@kings/db/server'

interface AdminResult {
  profileId: string
  userId: string
  error: null
}

interface AdminError {
  profileId: null
  userId: null
  error: NextResponse
}

export async function requireAdmin(): Promise<AdminResult | AdminError> {
  try {
    // Lê a sessão dos cookies (mesmo mecanismo do middleware)
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await (supabase.auth as any).getUser()

    if (!user) {
      return {
        profileId: null,
        userId: null,
        error: NextResponse.json(
          { error: 'Não autenticado. Faça login no painel admin.' },
          { status: 401 }
        ),
      }
    }

    // Buscar profile com service role para bypassar RLS
    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return {
        profileId: null,
        userId: null,
        error: NextResponse.json(
          { error: 'Acesso negado. Permissão de administrador necessária.' },
          { status: 403 }
        ),
      }
    }

    return {
      profileId: profile.id,
      userId: user.id,
      error: null,
    }
  } catch (err) {
    console.error('[requireAdmin] Erro inesperado:', err)
    return {
      profileId: null,
      userId: null,
      error: NextResponse.json(
        { error: 'Erro interno de autenticação.' },
        { status: 500 }
      ),
    }
  }
}
