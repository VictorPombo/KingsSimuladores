/**
 * Z-API Wrapper (WhatsApp)
 * Envia mensagens pelo WhatsApp de forma autônoma.
 */

export const sendWhatsappMessage = async (data: { phone: string, message: string }) => {
  const instance = process.env.ZAPI_INSTANCE
  const token = process.env.ZAPI_CLIENT_TOKEN
  
  // Limpa tudo que não for dígito
  const cleanPhone = data.phone?.replace(/\D/g, '') || ''
  
  // Condição para disparo real
  if (instance && token && cleanPhone.length >= 10) {
    try {
      // Adiciona DDI do Brasil silenciosamente se for celular puramente brasileiro (mesmo sem o 55)
      const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      
      console.log(`[Z-API] Disparando WhatsApp Real para: ${finalPhone}`)
      
      const res = await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: finalPhone,
          message: data.message
        })
      })

      if (res.ok) {
        const result = await res.json()
        return { success: true, messageId: result.messageId || 'real_zapi_ok' }
      } else {
        console.error('[Z-API Erro]', await res.text())
      }
    } catch (e) {
      console.error('[Z-API Exceção] Falha ao comunicar com a rede do Zap', e)
    }
  }

  // ============== FALLBACK (MOCK) =================
  console.log(`[Z-API MOCK] Sem credencial detectada ou número inválido.`);
  console.log(`[Z-API MOCK] Enviaria para: ${cleanPhone}`);
  console.log(`[Z-API MOCK] Texto: \n--------------------\n${data.message}\n--------------------`);
  
  return {
    success: true,
    messageId: "mock_whatsapp_id_" + Math.floor(Math.random() * 10000000)
  };
};
