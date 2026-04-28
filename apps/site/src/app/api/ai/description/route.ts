import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { brand, model, price, condition, hasBox, hasUsageMarks, shortDescription } = await req.json()

    if (!brand || !model) {
      return NextResponse.json({ error: 'Marca e modelo são obrigatórios' }, { status: 400 })
    }

    const conditionLabel: Record<string, string> = {
      novo: 'Novo (Lacrado)',
      like_new: 'Seminovo',
      good: 'Bom estado',
      fair: 'Aceitável',
    }

    const prompt = `Gere uma descrição honesta e profissional para este anúncio de simulador usado.

Produto: ${brand} ${model}
Preço: R$ ${price || 'não informado'}
Condição: ${conditionLabel[condition] || condition || 'não informado'}
Tem caixa original: ${hasBox ? 'Sim' : 'Não'}
Tem marcas de uso: ${hasUsageMarks ? 'Sim' : 'Não'}
Resumo do vendedor: ${shortDescription || 'não informado'}

Regras:
- Máximo 150 palavras
- Tom honesto e direto
- Mencionar o estado de conservação
- Destacar pontos positivos sem exagerar
- Se tem marcas de uso, mencionar de forma transparente
- Terminar com o motivo da venda (ex: upgrade de equipamento)
- Escrever em português brasileiro
- NÃO inventar especificações técnicas
- Não usar emojis
- Retornar APENAS o texto da descrição, sem aspas`

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Fallback: gera descrição template se não tiver API key
      const desc = `${brand} ${model} em ${conditionLabel[condition] || 'bom'} estado. ${hasBox ? 'Acompanha caixa original.' : ''} ${hasUsageMarks ? 'Possui marcas leves de uso, mas sem afetar funcionamento.' : 'Sem marcas de uso visíveis.'} ${shortDescription || ''} Motivo da venda: upgrade de setup. Envio e pagamento intermediados pela plataforma Meu Simulador Usado.`.trim()
      return NextResponse.json({ description: desc })
    }

    // Try Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      const description = data?.content?.[0]?.text || ''
      return NextResponse.json({ description })
    }

    // Fallback OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      const description = data?.choices?.[0]?.message?.content || ''
      return NextResponse.json({ description })
    }

    return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
