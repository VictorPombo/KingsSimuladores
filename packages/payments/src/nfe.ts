/**
 * MOCK: NFe.io API
 * REMOVE LATER: Substituir por API real após o sistema estar 100% funcional.
 */
export const issueInvoiceMock = async (data: any) => {
  console.log("[MOCK NFE] Emitindo nota fiscal para:", data);
  return {
    id: "mock_nfe_456",
    status: "issued",
    nfe_number: "99999",
    nfe_key: "35180512345678901234550010000999991234567890",
    pdf_url: "https://mock.nfe.io/pdf/mock",
    xml_url: "https://mock.nfe.io/xml/mock"
  };
};
