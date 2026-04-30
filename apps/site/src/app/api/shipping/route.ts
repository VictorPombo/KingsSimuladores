import { NextResponse } from 'next/server'

// Token e URL do Sandbox / Produção do Melhor Envio
const ME_API_URL = process.env.MELHOR_ENVIO_API_URL || 'https://sandbox.melhorenvio.com.br'
const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN || ''

export async function POST(req: Request) {
  try {
    const { originZip, destinationZip, weight, width, height, length, price } = await req.json()

    if (!originZip || !destinationZip) {
      return NextResponse.json({ error: 'CEP de origem e destino são obrigatórios' }, { status: 400 })
    }

    // Estrutura exigida pela API v2 de cálculo de frete do Melhor Envio
    const payload = {
      from: { postal_code: originZip.replace(/\D/g, '') },
      to: { postal_code: destinationZip.replace(/\D/g, '') },
      products: [
        {
          id: '1',
          width: width || 20,
          height: height || 20,
          length: length || 20,
          weight: weight || 1,
          insurance_value: price || 0,
          quantity: 1
        }
      ]
    }

    // Se não tiver token configurado, retorna uma simulação
    if (!ME_TOKEN) {
      console.warn('[SHIPPING] Token do Melhor Envio não encontrado. Retornando cotação simulada.')
      
      // Atraso simulado
      await new Promise(r => setTimeout(r, 600))
      
      return NextResponse.json([
        {
          id: 2,
          name: 'SEDEX (com seguro)',
          price: (35 + (weight || 1) * 3).toFixed(2),
          currency: 'R$',
          delivery_time: 3,
          company: { name: 'Correios', picture: 'https://melhorenvio.com.br/images/shipping-companies/correios.png' }
        },
        {
          id: 99,
          name: 'Retirar pessoalmente',
          price: '0.00',
          currency: 'R$',
          delivery_time: 0,
          company: { name: 'Retirada', picture: '' }
        }
      ])
    }

    // Chamada real para o Melhor Envio
    const response = await fetch(`${ME_API_URL}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ME_TOKEN}`,
        'User-Agent': 'KingsHub App (contato@kingssimuladores.com.br)'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[SHIPPING] Erro na API do Melhor Envio:', errorText)
      return NextResponse.json({ error: 'Falha ao cotar frete' }, { status: response.status })
    }

    const data = await response.json()
    
    // Filtrar apenas serviços que não retornaram erro (tem price > 0)
    let validServices = data.filter((s: any) => !s.error && s.price)
    
    // Deixar apenas SEDEX
    validServices = validServices.filter((s: any) => s.name.toUpperCase().includes('SEDEX'))
    
    // Adicionar Retirar em Mãos
    validServices.push({
      id: 99,
      name: 'Retirar pessoalmente',
      price: '0.00',
      currency: 'R$',
      delivery_time: 0,
      company: { name: 'Retirada', picture: '' }
    })
    
    return NextResponse.json(validServices)
  } catch (error: any) {
    console.error('[SHIPPING] Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
