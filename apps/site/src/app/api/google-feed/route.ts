import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

function escapeXml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch active products with brand and category data
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      brands ( name, display_name ),
      categories ( name )
    `)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching products for Google Feed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  if (!products) {
    return new NextResponse('No products found', { status: 404 })
  }

  // Generate XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Kings Simuladores</title>
    <link>https://www.kingssimuladores.com.br</link>
    <description>Catálogo de Produtos - Kings Simuladores</description>`

  products.forEach((product: any) => {
    const isMsu = product.brands?.name === 'msu'
    const condition = isMsu ? 'used' : 'new'
    const brandName = product.brands?.display_name || 'Kings Simuladores'
    const categoryName = product.categories?.name || 'Simuladores'
    const availability = product.stock > 0 ? 'in stock' : 'out of stock'
    const mainImage = (product.images && product.images.length > 0) ? product.images[0] : ''
    
    let priceXml = ''
    if (product.price_compare && product.price_compare > product.price) {
      priceXml = `
      <g:price>${Number(product.price_compare).toFixed(2)} BRL</g:price>
      <g:sale_price>${Number(product.price).toFixed(2)} BRL</g:sale_price>`
    } else {
      priceXml = `
      <g:price>${Number(product.price).toFixed(2)} BRL</g:price>`
    }

    xml += `
    <item>
      <g:id>${product.id}</g:id>
      <title>${escapeXml(product.title)}</title>
      <description>${escapeXml(product.description || product.title)}</description>
      <link>https://www.kingssimuladores.com.br/produto/${product.slug}</link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>${priceXml}
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`
  })

  xml += `
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    }
  })
}
