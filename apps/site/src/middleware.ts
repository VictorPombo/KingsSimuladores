import { updateSession } from '@kings/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 0. TELA DE BLOQUEIO / MANUTENÇÃO (MSU)
  // Bloqueio do MSU em produção a pedido do usuário para testes manuais. Liberado apenas para localhost.
  if (hostname.includes('meusimuladorusado.com.br')) {
    return new NextResponse(
      '<html><body style="background:#111;color:#fff;font-family:sans-serif;text-align:center;padding-top:20vh;"><h1>Meu Simulador Usado</h1><p>Em breve a maior pista de desapego do automobilismo virtual.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    )
  }

  // 1. REDIRECIONAMENTO DE LEGADO (TRAY)
  // Se o usuário tentar acessar /adm no domínio antigo, enviamos ele direto para o Commerce Suite da Tray
  if (url.pathname.startsWith('/adm') || url.pathname.startsWith('/admin_tray')) {
    if (hostname.includes('sevensimracing')) {
      return NextResponse.redirect(new URL(`https://1433338.commercesuite.com.br${url.pathname}${url.search}`))
    }
  }



  // 1. Atualiza a Sessão do Supabase (Importante rodar primeiro)
  const response = await updateSession(request)

  // Se o Supabase mandou redirecionar (ex: rota /admin bloqueada), respeitamos o redirect de auth
  if (response.headers.get('Location')) {
    return response
  }

  // 2. Lógica Multi-Tenant (Rewrite Silencioso)
  let rewritePath = null

  // Rotas que são globais e NÃO devem sofrer rewrite de domínio
  const SHARED_ROUTES = ['/api', '/admin', '/checkout']
  const isSharedRoute = SHARED_ROUTES.some(route => url.pathname.startsWith(route))

  // Se o domínio for da Seven
  if (hostname.includes('sevensimracing.com.br') || hostname.includes('seven.localhost')) {
    if (!url.pathname.startsWith('/seven') && !isSharedRoute) {
      rewritePath = `/seven${url.pathname === '/' ? '' : url.pathname}`
    }
  } 
  // Se o domínio for do MSU
  else if (hostname.includes('meusimuladorusado.com.br') || hostname.includes('msu.localhost')) {
    if (!url.pathname.startsWith('/usado') && !isSharedRoute) {
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
