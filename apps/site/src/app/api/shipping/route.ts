import { NextResponse } from 'next/server'
import { calculateShipping } from '@kings/shipping'

/**
 * API de Cálculo de Frete — PRODUÇÃO
 * Usa Frenet como gateway único de transportadoras.
 * CEP de origem vem de DEFAULT_ORIGIN_ZIP (env) ou do body da request.
 */

const DEFAULT_ORIGIN = process.env.DEFAULT_ORIGIN_ZIP || '12929608'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Suporta os dois formatos de chamada do frontend
    const toPostalCode = body.destinationZip || body.toPostalCode
    const fromPostalCode = body.originZip || DEFAULT_ORIGIN

    if (!toPostalCode) {
      return NextResponse.json({ error: 'CEP de destino é obrigatório' }, { status: 400 })
    }

    const cleanCep = toPostalCode.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      return NextResponse.json({ error: 'CEP de destino inválido' }, { status: 400 })
    }

    // Montar dimensões a partir dos itens (ou usar padrão para simuladores)
    const dimensions = body.dimensions || [{
      weight: body.items 
        ? body.items.reduce((acc: number, item: any) => acc + (item.quantity || 1) * 15, 0)  // ~15kg por item padrão
        : 15,
      width: 60,
      height: 50,
      length: 80,
      quantity: 1,
      insurance_value: body.items
        ? body.items.reduce((acc: number, item: any) => acc + (item.price || 0) * (item.quantity || 1), 0)
        : 0
    }]

    const shippingOptions = await calculateShipping(fromPostalCode, cleanCep, dimensions)

    if (!shippingOptions || shippingOptions.length === 0) {
      return NextResponse.json({ 
        error: 'Não foi possível calcular o frete para este CEP. Verifique o CEP e tente novamente.',
        options: [] 
      }, { status: 200 })
    }

    // Adicionar opção "Retirada no local"
    const optionsWithPickup = [
      ...shippingOptions.map(opt => ({
        id: opt.id,
        name: `${opt.company} ${opt.name}`,
        company: opt.company,
        price: opt.price,
        currency: 'R$',
        delivery_time: opt.custom_delivery_time,
        custom_delivery_time: opt.custom_delivery_time,
      })),
      {
        id: 'pickup',
        name: 'Retirada no Local',
        company: 'Kings Simuladores',
        price: '0.00',
        currency: 'R$',
        delivery_time: 0,
        custom_delivery_time: 0,
      }
    ]

    return NextResponse.json({ options: optionsWithPickup })

  } catch (error: any) {
    console.error('[Shipping API] Erro:', error.message || error)
    return NextResponse.json({ 
      error: 'Não foi possível calcular o frete. Tente novamente em instantes.' 
    }, { status: 500 })
  }
}
