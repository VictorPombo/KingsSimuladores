import { updateSession } from '@kings/db'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 0. TELA DE BLOQUEIO / MANUTENÇÃO (URGENTE)
  // Permite que os administradores ignorem a tela acessando qualquer URL com ?admin_bypass=kings
  if (url.searchParams.get('admin_bypass') === 'kings') {
    const res = NextResponse.redirect(new URL(url.pathname, request.url))
    res.cookies.set('dev_access', 'granted', { maxAge: 60 * 60 * 24 * 30, path: '/' })
    return res
  }

  // 1. REDIRECIONAMENTO DE LEGADO (TRAY)
  // Se o usuário tentar acessar /adm no domínio antigo, enviamos ele direto para o Commerce Suite da Tray
  if (url.pathname.startsWith('/adm') || url.pathname.startsWith('/admin_tray')) {
    if (hostname.includes('sevensimracing')) {
      return NextResponse.redirect(new URL(`https://sevensimracing.tray.com.br${url.pathname}${url.search}`))
    }
  }

  const hasDevAccess = request.cookies.has('dev_access')
  
  // Se não tem acesso liberado, e não é uma rota interna estática/imagem
  if (!hasDevAccess && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next') && url.pathname !== '/favicon.ico' && url.pathname !== '/icon.png') {
    
    // Customização Multi-Tenant para a Tela de Bloqueio
    let brandName = 'KINGSHUB'
    let devTitle = 'Em Desenvolvimento | KingsHub'
    let themeColor = '#00e5ff'
    let secondaryColor = '#8b5cf6'

    if (hostname.includes('sevensimracing.com.br') || hostname.includes('seven.localhost')) {
      brandName = 'SEVEN SIM RACING'
      devTitle = 'Em Desenvolvimento | Seven Sim Racing'
      themeColor = '#ea580c' // Laranja Seven
      secondaryColor = '#f97316'
    } else if (hostname.includes('meusimuladorusado.com.br') || hostname.includes('msu.localhost')) {
      brandName = 'MEU SIMULADOR USADO'
      devTitle = 'Em Desenvolvimento | MSU'
      themeColor = '#06b6d4' // Ciano MSU
      secondaryColor = '#3b82f6'
    }

    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${devTitle}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Rajdhani:wght@600;700&display=swap" rel="stylesheet">
        <style>
          body { background-color: #06080f; color: #e8ecf4; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; background-image: radial-gradient(circle at center, ${themeColor}10 0%, transparent 60%); }
          .container { max-width: 600px; padding: 40px; background: rgba(12, 16, 24, 0.6); border: 1px solid ${themeColor}20; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); }
          h1 { font-family: 'Rajdhani', sans-serif; font-size: 2.5rem; margin-bottom: 16px; background: linear-gradient(135deg, ${themeColor}, ${secondaryColor}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 1px; }
          p { font-size: 1.1rem; color: #8892a8; line-height: 1.6; margin-bottom: 24px; }
          .logo { font-family: 'Rajdhani', sans-serif; font-size: 1.2rem; font-weight: 700; letter-spacing: 3px; color: ${themeColor}; margin-bottom: 30px; opacity: 0.8; }
          .pulse-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${themeColor}; margin-right: 8px; box-shadow: 0 0 10px ${themeColor}; animation: pulse 2s infinite; }
          @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.8; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">${brandName}</div>
          <h1>Em Desenvolvimento</h1>
          <p><span class="pulse-dot"></span> Nossa plataforma está passando por atualizações profundas na infraestrutura para o lançamento oficial.</p>
          <p style="font-size: 0.9rem;">Por favor, volte mais tarde. O acesso está temporariamente restrito à equipe técnica.</p>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 })
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
