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

  const items = (products || []).map((p: any) => {
    const brandName = Array.isArray(p.brands) ? p.brands[0]?.name : p.brands?.name || 'Kings Simuladores'
    const availability = p.stock_quantity > 0 ? 'in_stock' : 'out_of_stock'
    const condition = 'new'
    const price = `${Number(p.price).toFixed(2)} BRL`
    const salePrice = p.compare_at_price && p.compare_at_price > p.price
      ? `${Number(p.price).toFixed(2)} BRL`
      : ''
    const regularPrice = p.compare_at_price && p.compare_at_price > p.price
      ? `${Number(p.compare_at_price).toFixed(2)} BRL`
      : price

    return `    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.title}]]></g:title>
      <g:description><![CDATA[${p.description || p.title}]]></g:description>
      <g:link>${BASE_URL}/produtos/${p.id}</g:link>
      <g:image_link>${p.image_url || 'https://placehold.co/800x800/131928/e8ecf4?text=Kings'}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${regularPrice}</g:price>${salePrice ? `\n      <g:sale_price>${salePrice}</g:sale_price>` : ''}
      <g:brand><![CDATA[${brandName}]]></g:brand>
      <g:condition>${condition}</g:condition>
      <g:product_type><![CDATA[${p.category || 'Simuladores de Corrida'}]]></g:product_type>
      <g:shipping>
        <g:country>BR</g:country>
        <g:service>Correios</g:service>
      </g:shipping>
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Kings Simuladores — Catálogo de Produtos</title>
    <link>${BASE_URL}</link>
    <description>Feed de produtos para Google Merchant Center</description>
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
