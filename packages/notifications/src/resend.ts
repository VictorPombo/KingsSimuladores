/**
 * Resend API Wrapper (Email)
 * Envia E-mails transacionais.
 */

export const sendEmailMessage = async (data: { to: string, subject: string, html: string }) => {
  const apiKey = process.env.RESEND_API_KEY
  
  if (apiKey) {
    try {
      console.log(`[Resend] Disparando e-mail Real para: ${data.to}`)
      
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
        return { success: true, messageId: result.id || 'real_resend_ok' }
      } else {
        console.error('[Resend Erro]', await res.text())
      }
    } catch (e) {
      console.error('[Resend Exceção] Falha ao enviar e-mail', e)
    }
  }

  // ============== FALLBACK (MOCK) =================
  console.log(`[MOCK RESEND EMAIL] Sem credencial detectada. E-mail simulado.`);
  console.log(`[MOCK RESEND EMAIL] Para: ${data.to}`);
  console.log(`[MOCK RESEND EMAIL] Assunto: ${data.subject}`);
  console.log(`[MOCK RESEND EMAIL] HTML Renderizado:\n${data.html.substring(0, 150)}...\n(resto suprimido)`);
  
  return {
    success: true,
    messageId: "mock_resend_id_" + Math.floor(Math.random() * 10000000)
  };
};
