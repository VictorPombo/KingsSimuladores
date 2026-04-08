import { MetadataRoute } from 'next'
import { createAdminClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

// URL base do site — será trocada pelo domínio real quando o DNS for apontado
const BASE_URL = process.env.NEXT_PUBLIC_URL_KINGS || 'https://kingssimuladores.com.br'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  // ── Páginas estáticas ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/produtos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/usado`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // ── Produtos Kings (Loja Principal) ──
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .gt('stock_quantity', 0)

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE_URL}/produtos/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // ── Listings MSU (Marketplace de Usados) ──
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('id, updated_at')
    .eq('status', 'approved')

  const listingPages: MetadataRoute.Sitemap = (listings || []).map((l) => ({
    url: `${BASE_URL}/usado/produto/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...listingPages]
}
