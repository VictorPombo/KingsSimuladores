import { updateSession } from '@kings/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 1. Atualiza a Sessão do Supabase (Importante rodar primeiro)
  const response = await updateSession(request)

  // Se o Supabase mandou redirecionar (ex: rota /admin bloqueada), respeitamos o redirect de auth
  if (response.headers.get('Location')) {
    return response
  }

  // 2. Lógica Multi-Tenant (Rewrite Silencioso)
  let rewritePath = null

  // Se o domínio for da Seven
  if (hostname.includes('sevensimracing.com.br') || hostname.includes('seven.localhost')) {
    if (!url.pathname.startsWith('/seven') && !url.pathname.startsWith('/api')) {
      rewritePath = `/seven${url.pathname === '/' ? '' : url.pathname}`
    }
  } 
  // Se o domínio for do MSU
  else if (hostname.includes('meusimuladorusado.com.br') || hostname.includes('msu.localhost')) {
    if (!url.pathname.startsWith('/usado') && !url.pathname.startsWith('/api')) {
      rewritePath = `/usado${url.pathname === '/' ? '' : url.pathname}`
    }
  }

  // 3. Aplica o Rewrite transferindo os cookies de autenticação
  if (rewritePath) {
    const rewriteResponse = NextResponse.rewrite(new URL(rewritePath, request.url))
    // Transfere os cookies gerados pelo `updateSession`
    response.headers.forEach((value, key) => {
      rewriteResponse.headers.append(key, value)
    })
    return rewriteResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
