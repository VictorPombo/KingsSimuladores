import { NextResponse } from 'next/server'

const FRENET_TOKEN = process.env.FRENET_TOKEN || ''

export async function POST(req: Request) {
  try {
    const { destinationZip, originZip, items, toPostalCode, dimensions } = await req.json()
    const destZip = destinationZip || toPostalCode

    if (!destZip) {
      return NextResponse.json({ error: 'CEP de destino é obrigatório' }, { status: 400 })
    }

    const payload = {
      SellerCEP: originZip || '03141030',
      RecipientCEP: destZip.replace(/\D/g, ''),
      ShipmentInvoiceValue: 100, // could calculate from items, but optional
      ShippingItemArray: [] as any[]
    }

    if (items && items.length > 0) {
      payload.ShippingItemArray = items.map((item: any) => ({
        Height: 20,
        Length: 20,
        Width: 20,
        Weight: 2, 
        Quantity: item.quantity
      }))
    } else if (dimensions && dimensions.length > 0) {
      payload.ShippingItemArray = dimensions.map((dim: any) => ({
        Height: dim.height || 20,
        Length: dim.length || 20,
        Width: dim.width || 20,
        Weight: dim.weight || 2,
        Quantity: 1
      }))
    } else {
      payload.ShippingItemArray = [{ Height: 20, Length: 20, Width: 20, Weight: 2, Quantity: 1 }]
    }

    const response = await fetch("https://api.frenet.com.br/shipping/quote", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'token': FRENET_TOKEN
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('[Frenet] Erro na API:', await response.text())
      return NextResponse.json({ error: 'Falha ao cotar frete no Frenet.' }, { status: response.status })
    }

    const data = await response.json()
    
    if (data.ShippingSevicesArray && Array.isArray(data.ShippingSevicesArray)) {
      const validServices = data.ShippingSevicesArray.filter((s: any) => !s.Error && s.ServiceDescription.toUpperCase().includes('SEDEX'))
      
      const formattedOptions = validServices.map((s: any) => ({
        id: s.ServiceCode,
        name: s.ServiceDescription,
        price: s.ShippingPrice,
        currency: 'R$',
        custom_delivery_time: s.DeliveryTime, // added to match ShippingSimulator expectation
        delivery_time: s.DeliveryTime,
        company: { name: s.Carrier, picture: '' }
      }))

      // Ordenar do mais barato pro mais caro
      formattedOptions.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price))

      return NextResponse.json({ options: formattedOptions })
    }

    return NextResponse.json({ options: [] })

  } catch (error: any) {
    console.error('[Frenet] Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
