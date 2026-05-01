import { NextResponse } from 'next/server'

// Simulando a configuração do Olist PAX
const OLIST_PAX_URL = process.env.OLIST_PAX_URL || 'https://api.olist.com/v1/pax/quotes'
const OLIST_TOKEN = process.env.OLIST_ACCESS_TOKEN || ''

export async function POST(req: Request) {
  try {
    const { destinationZip, originZip, items } = await req.json()

    if (!destinationZip) {
      return NextResponse.json({ error: 'CEP de destino é obrigatório' }, { status: 400 })
    }

    // Calcula o peso total aproximado (mock)
    const totalWeight = items ? items.reduce((acc: number, item: any) => acc + (item.quantity * 2), 0) : 2

    // Modo Sandbox (sem token real configurado para o Olist)
    if (!OLIST_TOKEN || OLIST_TOKEN === 'SANDBOX_MODE_ACTIVE') {
      console.warn('[Olist PAX] Token não encontrado. Retornando cotação SEDEX simulada via Olist.')
      
      // Atraso simulado de rede
      await new Promise(r => setTimeout(r, 600))
      
      // O frontend espera `data.options`
      return NextResponse.json({
        options: [
          {
            id: 'olist_sedex_01',
            name: 'Olist PAX - Correios SEDEX',
            price: (35 + totalWeight * 3).toFixed(2),
            currency: 'R$',
            delivery_time: 3,
            company: { name: 'Correios', picture: 'https://rastreamento.correios.com.br/static/rastreamento-internet/imgs/correios-logo.png' }
          }
        ]
      })
    }

    // Chamada real para o Olist PAX (futuro)
    const payload = {
      origin: { zip_code: originZip || '03141030' },
      destination: { zip_code: destinationZip.replace(/\D/g, '') },
      packages: [
        {
          width: 20,
          height: 20,
          length: 20,
          weight: totalWeight
        }
      ]
    }

    const response = await fetch(OLIST_PAX_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OLIST_TOKEN}`,
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Falha ao cotar frete no Olist' }, { status: response.status })
    }

    const data = await response.json()
    
    // Supondo que a API do Olist retorna os serviços, filtramos para deixar APENAS SEDEX
    let validServices = data.quotes || []
    validServices = validServices.filter((s: any) => s.service_name.toUpperCase().includes('SEDEX'))
    
    // Mapeamos para o formato que o frontend espera
    const formattedOptions = validServices.map((s: any) => ({
      id: s.id,
      name: `Olist PAX - ${s.service_name}`,
      price: s.price,
      currency: 'R$',
      delivery_time: s.delivery_days,
      company: { name: s.carrier, picture: '' }
    }))
    
    return NextResponse.json({ options: formattedOptions })

  } catch (error: any) {
    console.error('[Olist PAX] Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
