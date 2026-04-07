import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'

const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createAdminClient()

  // Buscar todos os produtos ativos com estoque
  const { data: products } = await supabase
    .from('products')
    .select('id, title, description, price, compare_at_price, image_url, brand_id, stock_quantity, category, updated_at, brands(name)')
    .gt('stock_quantity', 0)

  // TikTok usa um formato RSS/XML muito parecido com o Google mas com nomes de campo ligeiramente diferentes
  const items = (products || []).map((p: any) => {
    const brandName = Array.isArray(p.brands) ? p.brands[0]?.name : p.brands?.name || 'Kings Simuladores'
    const availability = p.stock_quantity > 0 ? 'in stock' : 'out of stock'
    const condition = 'new'
    const price = `${Number(p.price).toFixed(2)} BRL`

    return `    <item>
      <id>${p.id}</id>
      <title><![CDATA[${p.title}]]></title>
      <description><![CDATA[${p.description || p.title}]]></description>
      <availability>${availability}</availability>
      <condition>${condition}</condition>
      <price>${price}</price>
      <link>${BASE_URL}/produtos/${p.id}</link>
      <image_link>${p.image_url || 'https://placehold.co/800x800/131928/e8ecf4?text=Kings'}</image_link>
      <brand><![CDATA[${brandName}]]></brand>
      <item_group_id>${p.category || 'simuladores'}</item_group_id>
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Kings Simuladores — TikTok Product Catalog</title>
    <link>${BASE_URL}</link>
    <description>Feed de produtos para TikTok Shopping</description>
${items.join('\n')}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
    },
  })
}
