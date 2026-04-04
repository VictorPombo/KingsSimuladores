/**
 * MOCK: Z-API (WhatsApp)
 * REMOVE LATER: Substituir por API real após o sistema estar 100% funcional.
 */
export const sendWhatsappMock = async (data: { phone: string, message: string }) => {
  console.log(`[MOCK WHATSAPP] Mensagem para ${data.phone}:`);
  console.log(`[MOCK WHATSAPP] Conteudo: ${data.message}`);
  return {
    success: true,
    messageId: "mock_whatsapp_id_" + Math.floor(Math.random() * 10000000)
  };
};
