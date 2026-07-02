import { updateSession } from '@kings/db'
import { NextResponse, type NextRequest } from 'next/server'

// Detecta se está rodando em localhost (dev) ou produção (Vercel)
function isLocalhost(hostname: string): boolean {
  return hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.startsWith('192.168.')
}

// Card HTML de "Em Desenvolvimento" para MSU em produção
const MSU_DEV_CARD = `
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meu Simulador Usado</title></head>
<body style="background:#0a0a0f;color:#fff;font-family:'Inter',system-ui,sans-serif;text-align:center;padding-top:15vh;margin:0;">
  <div style="max-width:480px;margin:0 auto;padding:0 24px;">
    <div style="font-size:64px;margin-bottom:24px;">🏁</div>
    <h1 style="font-size:28px;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,#00e5ff,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Meu Simulador Usado</h1>
    <p style="font-size:16px;color:#a0a0b0;line-height:1.6;margin-bottom:32px;">Em breve a maior pista de desapego do automobilismo virtual. Estamos finalizando os testes.</p>
    <div style="padding:16px 24px;border-radius:12px;border:1px solid rgba(0,229,255,0.2);background:rgba(0,229,255,0.05);display:inline-block;">
      <span style="font-size:13px;color:#00e5ff;font-weight:600;letter-spacing:1px;">EM DESENVOLVIMENTO</span>
    </div>
    <p style="font-size:13px;color:#555;margin-top:40px;">Kings Simuladores &copy; 2026</p>
  </div>
</body>
</html>`

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const isLocal = isLocalhost(hostname)

  // 0. BLOQUEIO MSU EM PRODUÇÃO (Vercel)
  // Bloqueia TODO acesso à MSU em produção: domínio, ?tenant=msu, rotas /usado e cookie dev_tenant=msu.
  // Liberado APENAS em localhost para testes internos.
  if (!isLocal) {
    // 0a. Domínio direto da MSU
    if (hostname.includes('meusimuladorusado.com.br')) {
      return new NextResponse(MSU_DEV_CARD, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // 0b. Tentativa de forçar tenant MSU via query param em produção
    if (url.searchParams.get('tenant') === 'msu') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 0c. Acesso direto a rotas /usado em produção
    if (url.pathname.startsWith('/usado')) {
      return new NextResponse(MSU_DEV_CARD, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // 0d. Cookie dev_tenant=msu em produção — limpa o cookie e redireciona
    if (request.cookies.get('dev_tenant')?.value === 'msu') {
      const res = NextResponse.redirect(new URL('/', request.url))
      res.cookies.delete('dev_tenant')
      return res
    }
  }

  // 1. REDIRECIONAMENTO DE LEGADO (TRAY)
  if (url.pathname.startsWith('/adm') || url.pathname.startsWith('/admin_tray')) {
    if (hostname.includes('sevensimracing')) {
      return NextResponse.redirect(new URL(`https://1433338.commercesuite.com.br${url.pathname}${url.search}`))
    }
  }

  // 2. Atualiza a Sessão do Supabase (Importante rodar primeiro)
  const response = await updateSession(request)

  // Se o Supabase mandou redirecionar (ex: rota /admin bloqueada), respeitamos o redirect de auth
  if (response.headers.get('Location')) {
    return response
  }

  // 3. Lógica Multi-Tenant (Rewrite Silencioso)
  let rewritePath = null

  // Rotas que são globais e NÃO devem sofrer rewrite de domínio
  const SHARED_ROUTES = ['/api', '/admin', '/checkout']
  const isSharedRoute = SHARED_ROUTES.some(route => url.pathname.startsWith(route))

  // FORÇA TENANT VIA URL (Útil para testes no celular com IP local)
  if (url.searchParams.get('tenant')) {
    const tenant = url.searchParams.get('tenant')!
    const res = NextResponse.redirect(new URL(url.pathname, request.url))
    res.cookies.set('dev_tenant', tenant, { path: '/' })
    return res
  }
  const testTenant = request.cookies.get('dev_tenant')?.value

  // Se o domínio for da Seven
  if (testTenant === 'seven' || hostname.includes('sevensimracing.com.br') || hostname.includes('seven.localhost')) {
    if (!url.pathname.startsWith('/seven') && !isSharedRoute) {
      rewritePath = `/seven${url.pathname === '/' ? '' : url.pathname}`
    }
  } 
  // Se o domínio for do MSU (só chega aqui em localhost, produção já foi bloqueada acima)
  else if (testTenant === 'msu' || hostname.includes('meusimuladorusado.com.br') || hostname.includes('msu.localhost')) {
    if (!url.pathname.startsWith('/usado') && !isSharedRoute) {
      rewritePath = `/usado${url.pathname === '/' ? '' : url.pathname}`
    }
  }

  // 4. Aplica o Rewrite transferindo os cookies de autenticação
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
