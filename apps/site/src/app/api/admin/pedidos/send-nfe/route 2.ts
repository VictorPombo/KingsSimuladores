import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db'
import { sendEmailMessage } from '@kings/notifications'

export async function POST(req: Request) {
  try {
    const { order_id, pdf_url, customer_email, customer_name, order_number } = await req.json()
    if (!order_id || !pdf_url || !customer_email) {
      return NextResponse.json({ error: 'Faltam parâmetros obrigatórios' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Validar se é admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const orderIdDisplay = order_number ? `#${order_number}` : `ID ${order_id.split('-')[0]}`

    // Montar HTML do e-mail
    const html = `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Olá, ${customer_name}!</h2>
        <p>A Nota Fiscal do seu pedido <strong>${orderIdDisplay}</strong> já foi emitida.</p>
        <p>O arquivo PDF está anexado a este e-mail para sua conferência.</p>
        <br/>
        <p>Agradecemos a preferência!</p>
        <p><strong>Kings Simuladores</strong></p>
      </div>
    `

    let finalPdfUrl = pdf_url;
    if (!pdf_url.startsWith('http')) {
      const { data, error } = await supabase.storage.from('invoices').createSignedUrl(pdf_url, 3600); // 1 hora
      if (error || !data) {
        return NextResponse.json({ error: 'Erro ao gerar URL do PDF interno' }, { status: 500 })
      }
      finalPdfUrl = data.signedUrl;
    }

    // Enviar e-mail usando Resend
    const result = await sendEmailMessage({
      to: customer_email,
      subject: `Nota Fiscal Emitida - Pedido ${orderIdDisplay}`,
      html,
      attachments: [
        {
          filename: `NFe_Pedido_${orderIdDisplay.replace('#', '')}.pdf`,
          path: finalPdfUrl
        }
      ]
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Falha ao enviar e-mail via provedor' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (err: any) {
    console.error('Send NFe Error:', err)
    return NextResponse.json({ error: 'Erro interno ao enviar nota fiscal' }, { status: 500 })
  }
}
