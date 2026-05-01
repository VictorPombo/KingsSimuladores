/**
 * Resend API Wrapper (Email) — PRODUÇÃO
 * Envia E-mails transacionais. Se sem credencial, loga aviso e retorna success: false.
 */

export const sendEmailMessage = async (data: { to: string, subject: string, html: string }) => {
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey || apiKey.includes('preencher')) {
    console.warn(`[Resend] API Key não configurada. E-mail para ${data.to} NÃO foi enviado.`)
    return { success: false, messageId: null }
  }

  try {
    console.log(`[Resend] Disparando e-mail para: ${data.to}`)
    
    const res = await fetch(`https://api.resend.com/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KingsHub <contato@kingssimuladores.com.br>',
        to: [data.to],
        subject: data.subject,
        html: data.html
      })
    })

    if (res.ok) {
      const result = await res.json()
      return { success: true, messageId: result.id || 'resend_ok' }
    } else {
      console.error('[Resend Erro]', await res.text())
      return { success: false, messageId: null }
    }
  } catch (e) {
    console.error('[Resend Exceção] Falha ao enviar e-mail', e)
    return { success: false, messageId: null }
  }
};
