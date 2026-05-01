/**
 * Chatwoot API Wrapper (WhatsApp) — PRODUÇÃO
 * Envia mensagens pelo WhatsApp via Chatwoot.
 * Se sem credencial, loga aviso e retorna success: false.
 */

export const sendWhatsappMessage = async (data: { phone: string, message: string }) => {
  const baseUrl = process.env.CHATWOOT_BASE_URL
  const token = process.env.CHATWOOT_API_ACCESS_TOKEN
  const accountId = process.env.CHATWOOT_ACCOUNT_ID
  const inboxId = process.env.CHATWOOT_INBOX_ID
  
  // Limpa tudo que não for dígito
  const cleanPhone = data.phone?.replace(/\D/g, '') || ''
  
  // Condição para disparo real
  if (!baseUrl || !token || !accountId || !inboxId || cleanPhone.length < 10) {
    console.warn(`[Chatwoot] Credenciais incompletas ou número inválido. WhatsApp para +${cleanPhone} NÃO foi enviado.`)
    return { success: false, messageId: null }
  }

  try {
    // Adiciona DDI do Brasil se for celular puramente brasileiro
    const finalPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`
    
    console.log(`[Chatwoot] Disparando WhatsApp para: ${finalPhone}`)
    
    const res = await fetch(`${baseUrl}/api/v1/accounts/${accountId}/conversations/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'api_access_token': token
      },
      body: JSON.stringify({
        inbox_id: inboxId,
        source_id: finalPhone,
        message: data.message
      })
    })

    if (res.ok) {
      const result = await res.json()
      return { success: true, messageId: result.id || 'chatwoot_ok' }
    } else {
      console.error('[Chatwoot Erro]', await res.text())
      return { success: false, messageId: null }
    }
  } catch (e) {
    console.error('[Chatwoot Exceção] Falha ao comunicar com o servidor', e)
    return { success: false, messageId: null }
  }
};
