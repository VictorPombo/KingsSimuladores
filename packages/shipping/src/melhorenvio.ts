/**
 * MOCK: Melhor Envio API
 * REMOVE LATER: Substituir por API real após o sistema estar 100% funcional.
 */
export const calculateShippingMock = async (data: any) => {
  console.log("[MOCK SHIPPING] Calculando frete para:", data);
  return [
    {
      id: 1,
      name: "Correios PAC",
      price: "25.00",
      custom_price: "25.00",
      discount: "0.00",
      currency: "BRL",
      delivery_time: 7,
      error: null
    },
    {
      id: 2,
      name: "Correios SEDEX",
      price: "45.00",
      custom_price: "45.00",
      discount: "0.00",
      currency: "BRL",
      delivery_time: 3,
      error: null
    }
  ];
};

export const generateLabelMock = async (orderId: string) => {
  console.log("[MOCK SHIPPING] Gerando etiqueta para pedido:", orderId);
  return {
    success: true,
    tracking_code: "ME" + Math.floor(Math.random() * 10000000) + "BR",
    label_url: "https://mock.melhorenvio.com.br/label/print"
  };
};
