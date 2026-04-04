/**
 * MOCK: Mercado Pago API
 * REMOVE LATER: Substituir por API real após o sistema estar 100% funcional.
 */
export const createPaymentMock = async (data: any) => {
  console.log("[MOCK MP] Criando pagamento para:", data);
  return {
    id: "mock_payment_123",
    status: "approved", // Simular como aprovado instantaneamente pro dev
    transaction_amount: data.transaction_amount || 0,
    point_of_interaction: {
      transaction_data: {
        qr_code: "00020101021126580014br.gov.bcb.pix...",
        ticket_url: "https://www.mercadopago.com.br/mock/ticket"
      }
    }
  };
};
