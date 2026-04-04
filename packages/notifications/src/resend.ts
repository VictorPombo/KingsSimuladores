/**
 * MOCK: Resend API
 * REMOVE LATER: Substituir por API real após o sistema estar 100% funcional.
 */
export const sendEmailMock = async (data: { to: string, subject: string, body: string, attachment?: string }) => {
  console.log(`[MOCK EMAIL] Enviando email para ${data.to}`);
  console.log(`[MOCK EMAIL] Assunto: ${data.subject}`);
  return {
    success: true,
    messageId: "mock_resend_id_" + Math.floor(Math.random() * 10000000)
  };
};
