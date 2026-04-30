import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

/**
 * API de Cross-Sell Inteligente
 * 
 * Recebe as categorias dos produtos no carrinho e retorna
 * produtos complementares reais do banco.
 */

const CROSS_SELL_KEYWORDS: Record<string, string[]> = {
  volante: ['cockpit', 'pedal', 'suporte', 'luva', 'câmbio', 'freio de mão'],
  cockpit: ['volante', 'pedal', 'câmbio', 'freio de mão', 'luva'],
  pedais: ['volante', 'câmbio', 'cockpit', 'suporte', 'freio de mão'],
  cambio: ['cockpit', 'pedal', 'suporte', 'luva'],
  base: ['volante', 'cockpit', 'pedal', 'aro'],
  acessorio: ['cockpit', 'volante', 'pedal'],
}

function detectCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('cockpit') || t.includes('suporte para volante')) return 'cockpit'
  if (t.includes('volante') || t.includes('aro') || t.includes('addon')) return 'volante'
  if (t.includes('pedal') || t.includes('load cell') || t.includes('crp')) return 'pedais'
  if (t.includes('câmbio') || t.includes('shifter')) return 'cambio'
  if (t.includes('base') || t.includes('direct drive') || t.includes(' dd ') || t.includes(' r5') || t.includes(' r9') || t.includes(' r21')) return 'base'
  return 'acessorio'
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { cartItems, limit = 3 } = await request.json()

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // 1. Detectar categorias no carrinho
    const cartCategories = cartItems.map((item: any) => detectCategory(item.title))
    const cartIds = new Set(cartItems.map((i: any) => i.id))

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
      .eq('brands.name', 'kings')
      .gt('stock', 0)
      .or(orFilters)
      .order('price', { ascending: true })
      .limit(20)

    if (!products || products.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    // 4. Filtrar: remover itens que já estão no carrinho e sem imagem
    const suggestions = products
      .filter(p => !cartIds.has(p.id))
      .filter(p => p.images && p.images.length > 0 && p.images[0])
      .slice(0, limit)
      .map(p => ({
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
