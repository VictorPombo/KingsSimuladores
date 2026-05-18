import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const adminSupabase = createAdminClient()

    // 1. Gera o link de recuperação via Supabase Auth Admin API
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    if (error) {
      console.error('Error generating recovery link:', error)
      // Para segurança, não revelamos se o email existe ou não
      return NextResponse.json({ success: true })
    }

    const recoveryLink = data.properties.action_link

    // 2. Monta o HTML premium do email
    const htmlBody = [
      '<!DOCTYPE html><html><head><style>',
      'body { background-color: #0f121e; color: #ffffff; font-family: "Inter", sans-serif; margin: 0; padding: 0; }',
      '.container { max-width: 600px; margin: 40px auto; padding: 30px; background: #1a1e2e; border-radius: 16px; border: 1px solid #2a2e3e; text-align: center; }',
      '.logo { max-width: 150px; margin-bottom: 20px; }',
      'h1 { color: #00e5ff; font-size: 24px; margin-bottom: 10px; }',
      'p { color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }',
      '.btn { display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #00e896 100%); color: #000000; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }',
      '.footer { margin-top: 40px; font-size: 12px; color: #6b7280; }',
      '</style></head><body><div class="container">',
      '<img src="https://kingssimuladores.com.br/logo_kings.png" alt="Kings Simuladores" class="logo">',
      '<h1>Redefinição de Senha</h1>',
      '<p>Recebemos um pedido para redefinir a senha da sua conta na Kings Simuladores. Se foi você, clique no botão abaixo para criar uma nova senha de acesso.</p>',
      '<a href="' + recoveryLink + '" class="btn">Redefinir Minha Senha</a>',
      '<p class="footer">Se você não solicitou essa redefinição, apenas ignore este e-mail.<br>&copy; 2026 Kings Simuladores</p>',
      '</div></body></html>'
    ].join('')

    // 3. Tenta enviar via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    // Usa o domínio verificado se existir, senão usa onboarding@resend.dev (modo teste)
    const resendFrom = process.env.RESEND_FROM_KINGS || 'onboarding@resend.dev'

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + resendApiKey
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [email],
        subject: 'Redefinição de Senha - Kings Simuladores',
        html: htmlBody
      })
    })

    const resendData = await resendRes.json()

    if (!resendRes.ok) {
      console.error('Resend Error:', resendData)
      // Fallback: se o Resend falhar, retorna o link direto para o frontend redirecionar
      return NextResponse.json({ success: true, fallbackLink: recoveryLink })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Internal Error Reset:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
