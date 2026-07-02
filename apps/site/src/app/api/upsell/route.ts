import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

/**
 * API de Cross-Sell Inteligente
 * 
 * Recebe as categorias dos produtos no carrinho e retorna
 * produtos complementares reais do banco.
 */

const CROSS_SELL_KEYWORDS: Record<string, string[]> = {
  volante: ['cockpit', 'pedal', 'suporte', 'luva', 'câmbio', 'freio de mão', 'base'],
  cockpit: ['volante', 'pedal', 'câmbio', 'freio de mão', 'luva', 'base'],
  pedais: ['volante', 'câmbio', 'cockpit', 'suporte', 'freio de mão', 'base'],
  cambio: ['cockpit', 'pedal', 'suporte', 'luva', 'freio de mão'],
  base: ['volante', 'cockpit', 'pedal', 'aro', 'câmbio'],
  suporte: ['teclado', 'mousepad', 'acessório', 'mouse', 'tapete'],
  acessorio: ['cockpit', 'volante', 'pedal', 'base'],
}

function detectCategory(title: string): string {
  const t = title.toLowerCase()
  
  // Acessórios e partes (capturar antes para não classificar "Mola de Pedal" como "Pedal")
  if (t.includes('mola') || t.includes('acessório') || t.includes('kit') || t.includes('cabo') || t.includes('adaptador') || t.includes('performance') || t.includes('borracha') || t.includes('plate')) {
    if (t.includes('suporte para volante')) return 'cockpit'
    if (t.includes('suporte')) return 'suporte'
    return 'acessorio'
  }

  if (t.includes('cockpit') || t.includes('suporte para volante')) return 'cockpit'
  if (t.includes('suporte')) return 'suporte'
  if (t.includes('volante') || t.includes('aro') || t.includes('addon') || t.includes('wheel')) return 'volante'
  if (t.includes('pedal') || t.includes('load cell') || t.includes('crp') || t.includes('srp')) return 'pedais'
  if (t.includes('câmbio') || t.includes('shifter')) return 'cambio'
  if (t.includes('base') || t.includes('direct drive') || t.includes(' dd ') || t.match(/\br5\b/) || t.match(/\br9\b/) || t.match(/\br12\b/) || t.match(/\br16\b/) || t.match(/\br21\b/)) return 'base'
  if (t.includes('freio de mão') || t.includes('handbrake')) return 'freio de mao'
  
  return 'acessorio'
}

function getFamilies(title: string): string[] {
  const t = title.toLowerCase()
  const families: string[] = []
  if (t.includes('crp')) families.push('crp')
  if (t.match(/\bsrp\b/) || t.includes('sr-p') || t.includes('srp')) families.push('srp')
  if (t.match(/\br5\b/)) families.push('r5')
  if (t.match(/\br9\b/)) families.push('r9')
  if (t.match(/\br12\b/)) families.push('r12')
  if (t.match(/\br16\b/)) families.push('r16')
  if (t.match(/\br21\b/)) families.push('r21')
  if (t.match(/\bfsr\b/)) families.push('fsr')
  if (t.match(/\bks\b/)) families.push('ks')
  if (t.match(/\bgs\b/)) families.push('gs')
  if (t.match(/\bcs\b/)) families.push('cs')
  if (t.match(/\brs\b/)) families.push('rs')
  return families
}

// Fisher-Yates shuffle
function shuffleArray(array: any[]) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { cartItems, limit = 3, storeContext = 'kings' } = await request.json()

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // 1. Detectar categorias e famílias no carrinho
    const cartCategories = cartItems.map((item: any) => detectCategory(item.title))
    const cartIds = new Set(cartItems.map((i: any) => i.id))
    const cartFamilies = new Set<string>()
    cartItems.forEach((i: any) => {
      getFamilies(i.title).forEach(f => cartFamilies.add(f))
    })

    // 2. Calcular keywords complementares
    const searchKeywords = new Set<string>()
    cartCategories.forEach((cat: string) => {
      const keywords = CROSS_SELL_KEYWORDS[cat] || []
      keywords.forEach((kw: string) => searchKeywords.add(kw))
    })

    if (searchKeywords.size === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // 3. Buscar produtos reais do banco
    const supabase = await createServerSupabaseClient()
    const orFilters = Array.from(searchKeywords)
      .map(kw => `title.ilike.%${kw}%`)
      .join(',')

    const { data: products } = await supabase
      .from('products')
      .select('id, title, slug, price, images, attributes, stock, brands!inner(name)')
      .eq('status', 'active')
      .eq('brands.name', storeContext)
      .gt('stock', 0)
      .or(orFilters)
      .limit(50) // Pegar um pool maior para ter variedade

    if (!products || products.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // 4. Filtrar itens incompatíveis ou já no carrinho
    const validProducts = products.filter((p: any) => {
      // Remover se já está no carrinho ou sem imagem
      if (cartIds.has(p.id) || !p.images || p.images.length === 0 || !p.images[0]) {
        return false
      }

      const pCategory = detectCategory(p.title)
      const pFamilies = getFamilies(p.title)

      // Regra de Compatibilidade: se for um acessório de uma família específica, 
      // OBRIGATORIAMENTE o carrinho deve ter algum item dessa família.
      // Isso impede sugerir "Mola SRP" para quem comprou "Pedal CRP".
      if (pCategory === 'acessorio' && pFamilies.length > 0) {
        const matchesFamily = pFamilies.some(f => cartFamilies.has(f))
        if (!matchesFamily) return false
      }

      // Regra de Conflito de Família em Itens Principais (opcional):
      // Se o usuário tem "Pedal CRP", e sugerimos "Pedal SRP", não tem tanto problema porque
      // estamos filtrando "itens que ele já tem" pelas categorias complementares.
      // Mas para evitar redundância, se ele já tem um pedal, as keywords NÃO vão buscar outro pedal, 
      // a menos que o título do cockpit tenha "pedal" no nome.

      return true
    })

    // 5. Randomizar para evitar mostrar sempre os mesmos itens (como os mais baratos)
    const shuffled = shuffleArray(validProducts)

    const suggestions = shuffled
      .slice(0, limit)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        imageUrl: p.images[0],
        brand: p.attributes?.brand || 'Kings Simuladores',
        category: detectCategory(p.title),
      }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('[API Upsell Error]', error)
    return NextResponse.json({ suggestions: [] })
  }
}
