import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.LOJA_INTEGRADA_API_KEY
  const appKey = process.env.LOJA_INTEGRADA_APP_KEY

  if (!apiKey || !appKey) {
    return NextResponse.json({ error: 'LOJA_INTEGRADA_API_KEY ou LOJA_INTEGRADA_APP_KEY não configuradas no servidor.' }, { status: 500 })
  }

  const limit = 200
  let offset = 0
  let keepFetching = true
  const allClients: Array<{ nome: string, email: string, telefone: string }> = []

  try {
    while (keepFetching) {
      const url = `https://api.awsli.com.br/v1/cliente/?limit=${limit}&offset=${offset}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `chave_api ${apiKey} aplicacao ${appKey}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[LI API Error] Status: ${response.status} - ${response.statusText}`, errorText)
        
        // Se der erro 401, retornamos para o front lidar.
        if (response.status === 401) {
          return NextResponse.json({ 
            error: 'Não autorizado na API da Loja Integrada. Verifique se a chave de aplicação é necessária.',
            details: errorText
          }, { status: 401 })
        }
        
        return NextResponse.json({ error: 'Erro ao buscar dados na Loja Integrada' }, { status: response.status })
      }

      const data = await response.json()
      const objects = data.objects || []

      for (const c of objects) {
        const nome = `${c.nome || ''} ${c.sobrenome || ''}`.trim()
        const email = c.email || ''
        const telefone = c.telefone_principal || c.telefone || c.celular || c.fone || ''

        allClients.push({ nome, email, telefone })
      }

      if (objects.length < limit) {
        keepFetching = false
      } else {
        offset += limit
      }
    }

    // Gerar o CSV
    const headers = ['Nome', 'Email', 'Telefone']
    const rows = allClients.map(c => [
      `"${c.nome.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.telefone.replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clientes_loja_integrada.csv"`
      }
    })

  } catch (error: any) {
    console.error('Erro fatal na exportação de clientes:', error)
    return NextResponse.json({ error: 'Erro interno no servidor ao exportar clientes' }, { status: 500 })
  }
}
