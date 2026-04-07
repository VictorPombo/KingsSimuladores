/**
 * @kings/db — Supabase Middleware Client
 *
 * Para uso no middleware.ts do Next.js.
 * Renova a sessão do usuário em cada request.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

export async function updateSession(request: NextRequest) {
  // Skip if Supabase is not configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<any>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirecionar rotas clientes protegidas comuns
  const protectedPaths = ['/dashboard', '/account', '/orders']
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ─── ADMIN ROLE-BASED ACCESS CONTROL (RBAC) ───
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso livre à tela de login e página de unauthorized
    if (
      request.nextUrl.pathname.startsWith('/admin/login') ||
      request.nextUrl.pathname.startsWith('/admin/unauthorized')
    ) {
      return supabaseResponse
    }

    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Buscar profile para checar role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/unauthorized'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

