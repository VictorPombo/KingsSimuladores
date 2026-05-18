import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing from environment variables' }, { status: 500 })
    }

    // 1. Extract markdown via Jina
    const jinaResponse = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      headers: {
        "Accept": "application/json",
        "X-Return-Format": "markdown",
        "X-With-Images": "true"
      }
    })

    if (!jinaResponse.ok) {
      return NextResponse.json({ error: 'Failed to extract content from URL via Jina API' }, { status: 500 })
    }

    const jinaData = await jinaResponse.json()
    const markdownContent = jinaData?.data?.content || jinaData?.content || jinaData

    if (!markdownContent || typeof markdownContent !== 'string') {
      return NextResponse.json({ error: 'No content could be extracted from the page' }, { status: 500 })
    }

    // 2. Fetch live currency rates for professional conversion
    let exchangeRatesText = "Considere 1 USD = 5.50 BRL (fallback).";
    try {
      const exRes = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL");
      if (exRes.ok) {
        const exData = await exRes.json();
        const usd = parseFloat(exData.USDBRL?.bid || "5.50").toFixed(2);
        const eur = parseFloat(exData.EURBRL?.bid || "6.00").toFixed(2);
        const gbp = parseFloat(exData.GBPBRL?.bid || "7.00").toFixed(2);
        exchangeRatesText = `COTAÇÃO OFICIAL AO VIVO: 1 USD = R$ ${usd}, 1 EUR = R$ ${eur}, 1 GBP = R$ ${gbp}.`;
      }
    } catch (e) {
      console.error("Failed to fetch exchange rates", e);
    }

    // 3. Parse via Gemini
    const promptSystem = `Você é um arquiteto de sistemas e especialista em e-commerce. 
Analise o conteúdo markdown fornecido (que foi raspado de uma página de produto) e extraia TODAS as informações relevantes.
Retorne APENAS um JSON válido e estruturado.

ESTRUTURA ESPERADA DO JSON:
{
  "produto": {
    "titulo": "nome completo do produto",
    "titulo_curto": "nome resumido",
    "marca": "fabricante/marca do produto ou null",
    "modelo": "modelo/SKU ou null",
    "categoria_sugerida": "categoria principal",
    "tags": ["tag1", "tag2"]
  },
  "descricoes": {
    "descricao_completa": "Código HTML rico completo da página original. Você deve reconstruir a landing page usando tags <h2>, <p>, <ul> e principalmente tags <img> com as URLs originais da página. MANTENHA A DISPOSIÇÃO EXATA DAS IMAGENS. Todo o texto DEVE ser traduzido para Português (PT-BR).",
    "descricao_curta": "resumo de até 160 caracteres em Português",
    "diferenciais": ["diferencial 1", "diferencial 2"]
  },
  "especificacoes": [
    {
      "grupo": "nome do grupo (ex: Dimensões, Motor)",
      "itens": [
        { "nome": "Torque", "valor": "5Nm" }
      ]
    }
  ],
  "compatibilidade": {
    "plataformas": ["PC", "PS5"],
    "requisitos": "requisitos mínimos ou null"
  },
  "fiscal_e_dimensoes": {
    "ncm": "Tente deduzir o NCM. Para volantes, pedais, simuladores e video games use o padrão Mercosul '95045000'. Se for outro equipamento tente deduzir, caso contrário null",
    "ean": "EAN/Código de Barras do produto ou null",
    "peso_kg": "Peso do produto em KG como número. Busque exaustivamente por 'Weight', 'Peso', 'Mass', 'Gross Weight', 'kg', 'lbs' (se lbs, converta para kg). Se achar algo como '7.5kg', retorne apenas o número 7.5. MÁXIMA PRIORIDADE.",
    "largura_cm": "Largura em cm como número. Busque por 'Width', 'W', 'Largura'. Se achar em 'mm', divida por 10 para converter em cm. Se for um texto tipo '300x200x100mm', identifique a largura.",
    "altura_cm": "Altura em cm como número. Busque por 'Height', 'H', 'Altura'. Se achar em 'mm', divida por 10 para converter em cm.",
    "comprimento_cm": "Comprimento em cm como número. Busque por 'Length', 'Depth', 'L', 'D', 'Comprimento', 'Profundidade'. Se achar em 'mm', divida por 10."
  },
  "imagens": [
    {
      "url": "https://... (APENAS fotos reais do produto principal. IGNORE ícones, svgs, logos e vetores)",
      "descricao_alt": "descrição da imagem"
    }
  ],
  "avaliacoes": [
    {
      "reviewer_name": "Nome do Cliente",
      "rating": "Nota do cliente como número (ex: 5, 4.5). EXPORTE APENAS AVALIAÇÕES COM 4 OU 5 ESTRELAS.",
      "comment": "Comentário do cliente TRADUZIDO para Português (PT-BR)",
      "created_at": "Data da avaliação ou null se não houver"
    }
  ],
  "seo": {
    "meta_title_sugerido": "título SEO",
    "meta_description_sugerida": "descrição SEO",
    "slug_sugerido": "url-amigavel-produto"
  },
  "confianca": "alta|media|baixa"
}

INSTRUÇÕES DE EXTRAÇÃO (IMPORTANTE):
1. Leia o conteúdo cru da página fornecida (Markdown e Texto).
2. Extraia TODAS as informações relevantes sobre o produto (especificações, características, SEO, descrições ricas).
3. TRADUÇÃO OBRIGATÓRIA: VOCÊ DEVE TRADUZIR ABSOLUTAMENTE TODOS OS TEXTOS E DESCRITIVOS PARA O PORTUGUÊS DO BRASIL (PT-BR). NADA DEVE FICAR EM INGLÊS OU CHINÊS!
4. MANTENHA TODO CÓDIGO HTML DE IMAGENS INTACTO E FUNCIONAL DENTRO DA DESCRICAO COMPLETA. Use a propriedade style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0;" em TODAS as tags <img> geradas dentro de "descricao_completa".
5. Extraia de forma inteligente as principais imagens do produto, separando logotipos irrelevantes.
6. AVALIAÇÕES: Ignore qualquer avaliação de 1, 2 ou 3 estrelas. Você só pode extrair avaliações de 4 e 5 estrelas!
7. Retorne o resultado ESTRITAMENTE em formato JSON puro, sem marcações ou code blocks.`

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: markdownContent }] }],
        systemInstruction: { parts: [{ text: promptSystem }] },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    })

    if (!geminiResponse.ok) {
      return NextResponse.json({ error: `Gemini API Error (${geminiResponse.status})` }, { status: 500 })
    }

    const geminiData = await geminiResponse.json()
    const jsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!jsonText) {
      return NextResponse.json({ error: 'No structured content returned by AI' }, { status: 500 })
    }
    
    const parsedData = JSON.parse(jsonText)
    return NextResponse.json(parsedData)

  } catch (err: any) {
    console.error('Extraction Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
