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
    "preco_referencia": "Preço final de venda em REAIS (BRL) como float. Se o site estiver em moeda estrangeira, OBRIGATÓRIO converter para BRL multiplicando pela cotação ao vivo fornecida.",
    "moeda": "Sempre BRL",
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
    "peso_kg": "Peso do produto em KG como numero float. Procure por 'Weight' no texto. Se achar 2.95KG, retorne 2.95. Faça o máximo esforço para encontrar.",
    "largura_cm": "Largura em cm como numero float. Procure nas especificações de 'Dimensions'. Faça o máximo esforço.",
    "altura_cm": "Altura em cm como numero float. Procure nas especificações de 'Dimensions'. Faça o máximo esforço.",
    "comprimento_cm": "Comprimento em cm como numero float. Procure nas especificações de 'Dimensions'. Faça o máximo esforço."
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

REGRAS VITAIS:
1. ALUCINAÇÃO ZERO: Se uma informação (como preço, garantia ou avaliações) não existir, retorne null ou um array vazio []. NUNCA invente dados de avaliações, apenas traduza as que existirem. EXTRAIA APENAS AVALIAÇÕES DE 4 E 5 ESTRELAS. IGNORE qualquer review inferior a 4.
2. FOCO NO PRODUTO: Ignore textos de menus de navegação e rodapés, MAS CAPTURE as avaliações (reviews) dos clientes na página.
3. CÂMBIO EM TEMPO REAL: Preços devem ser números (float). Se o preço original for estrangeiro, CONVERTA AUTOMATICAMENTE para Reais (BRL). ${exchangeRatesText}
4. IDIOMA E TRADUÇÃO: Traduza APENAS os textos descritivos (títulos, descrições, ficha técnica, comentários de avaliação, tags) para o Português do Brasil (pt-BR). NÃO altere ou traduza modelos (SKU).
5. IMAGENS NA DESCRIÇÃO (MUITO IMPORTANTE): A 'descricao_completa' não deve ser apenas texto! Ela deve ser um HTML rico que intercala os parágrafos traduzidos com as tags <img> originais. Toda tag de imagem DEVE ter o estilo 'style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0;"' para garantir a responsividade. Exemplo: <h2>...</h2><p>...</p><img src="url_original_do_banner" style="max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0;" />.
6. IMAGENS REAIS: É estritamente proibido extrair URLs de ícones (svg, png de interface), logos, ilustrações vetorizadas ou ferramentas isoladas. Extraia APENAS fotos reais de alta qualidade do produto.`

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
