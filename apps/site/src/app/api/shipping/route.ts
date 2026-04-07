import { NextResponse } from 'next/server'
import { calculateShipping } from '@kings/shipping'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { toPostalCode, dimensions } = await request.json()

    if (!toPostalCode || !dimensions || dimensions.length === 0) {
      return NextResponse.json({ error: 'CEP ou dimensões ausentes.' }, { status: 400 })
    }

    // O CEP de origem padrão da KingsHub: 01001-000 (Sé, São Paulo)
    // No futuro pode vir de um .env: process.env.ORIGIN_CEP
    const fromPostalCode = process.env.ORIGIN_CEP || '01001000'

    const options = await calculateShipping(fromPostalCode, toPostalCode, dimensions)
    
    return NextResponse.json({ options })
  } catch (error) {
    console.error('[API Shipping Error]', error)
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 })
  }
}
