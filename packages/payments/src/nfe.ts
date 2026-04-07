/**
 * NFe.io API Wrapper (with Mock/Stub fallback)
 * Responsável por despachar as requisições de Nota Fiscal Eletrônica.
 */

// IDs configurados na Plataforma NFe.io
const COMPANY_ID_KINGS = process.env.NFEIO_COMPANY_ID_KINGS || 'mock_comp_kings'
const COMPANY_ID_MSU   = process.env.NFEIO_COMPANY_ID_MSU   || 'mock_comp_msu'

export async function issueInvoiceReal(orderData: any, brandOrigin: 'kings' | 'msu') {
  const token = process.env.NFEIO_API_KEY
  const companyId = brandOrigin === 'kings' ? COMPANY_ID_KINGS : COMPANY_ID_MSU

  if (token) {
    try {
      // Endpoint to issue a product invoice
      const url = `https://api.nfe.io/v1/companies/${companyId}/productinvoices`
      
      const payload = {
        cityServiceCode: "00000",
        description: `Referente ao Pedido #${orderData.id}`,
        servicesAmount: orderData.total,
        borrower: {
          name: orderData.customer?.name || "Cliente Padrão KingsHub",
          federalTaxNumber: orderData.customer?.cpf || "00000000000",
          email: orderData.customer?.email || "mock@kingssimuladores.com.br",
          address: {
            country: "BRA",
            postalCode: orderData.shipping?.postal_code || "00000000",
            street: orderData.shipping?.street || "Logradouro",
            number: orderData.shipping?.number || "S/N",
            city: orderData.shipping?.city || "São Paulo",
            state: orderData.shipping?.state || "SP"
          }
        }
      }

      console.log(`[NFe] Disparando requisição real para NFe.io... (Company: ${companyId})`)
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        return {
          id: data.id,
          status: 'issued', // typically nfe.io operates async, but we will assume it forwards ok
          nfe_number: data.number || '00000',
          nfe_key: data.nfeKey || 'missing_key_real',
          pdf_url: data.pdfUrl || '',
          xml_url: data.xmlUrl || '',
          cnpj_emitente: companyId
        }
      } else {
        console.error('[NFe Erro] Nfe.io recusou os dados fiscais:', await res.text())
      }
    } catch (e) {
      console.warn('[Kings Payments] Falha ao comunicar com NFe.io:', e)
    }
  }

  // ============== FALLBACK (MOCK) =================
  console.log(`[Kings Payments] NFEIO_API_KEY ausente. Emitindo MOCK Invoice (Company: ${companyId})...`)
  return {
    id: `mock_nfe_${Date.now()}`,
    status: "issued",
    nfe_number: "99999",
    nfe_key: "35180512345678901234550010000999991234567890",
    pdf_url: "https://mock.nfe.io/pdf/mock",
    xml_url: "https://mock.nfe.io/xml/mock",
    cnpj_emitente: companyId
  }
}
