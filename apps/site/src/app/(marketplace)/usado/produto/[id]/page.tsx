import React from 'react'
import { Container, Button } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import { formatPrice } from '@kings/utils'
import { notFound } from 'next/navigation'
import { MessageCircle, ShieldCheck, Package, AlertTriangle, MapPin } from 'lucide-react'
import { NegotiateButton } from '@/components/marketplace/NegotiateButton'
import { SellerReputation } from '@/components/marketplace/SellerReputation'

export const dynamic = 'force-dynamic'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = await createServerSupabaseClient()
  
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('title, price, images, description')
    .eq('id', params.id)
    .single()

  if (!listing) {
    return { title: 'Produto não encontrado | MSU' }
  }

  const formatBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(listing.price)

  return {
    title: `${listing.title} - ${formatBRL} | Meu Simulador Usado`,
    description: listing.description.substring(0, 150) + '...',
    openGraph: {
      title: `${listing.title} por apenas ${formatBRL}`,
      description: 'Confira este equipamento no Maior Marketplace de Sim Racing do Brasil.',
      images: [listing.images[0]],
      siteName: 'Meu Simulador Usado',
      type: 'website',
    },
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()
  
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      profiles (
        full_name,
        created_at
      )
    `)
    .eq('id', params.id)
    .single()

  if (!listing) return notFound()

  const sellerName = (listing as any).profiles?.full_name || 'Piloto Vendedor'
  
  // WhatsApp OFICIAL da plataforma (MSU-02: nunca expor telefone do vendedor)
  const MSU_OFFICIAL_PHONE = '5511999999999' // TODO: substituir pelo número real da plataforma
  const zapMessage = encodeURIComponent(`Olá! Tenho interesse no anúncio:\n\n*${listing.title}* por ${formatPrice(listing.price)}\nID: ${listing.id.split('-')[0]}\n\nGostaria de negociar com segurança pela plataforma.`)
  const whatsappUrl = `https://wa.me/${MSU_OFFICIAL_PHONE}?text=${zapMessage}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    image: listing.images,
    description: listing.description,
    brand: {
      '@type': 'Brand',
      name: listing.brand || 'Marca não informada',
    },
    offers: {
      '@type': 'Offer',
      url: `https://meusimuladorusado.com.br/usado/produto/${listing.id}`,
      priceCurrency: 'BRL',
      price: listing.price,
      itemCondition: listing.condition === 'novo' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Person',
        name: sellerName,
      },
    },
  }

  return (
    <div className="msu-product-page-wrapper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="msu-detail-grid">
          
          {/* Esquerda: Fotos e Descrição */}
          <div>
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '1rem', overflow: 'hidden', background: '#000', marginBottom: '2rem' }}>
              <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>Descrição do Anúncio</h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {listing.description}
            </div>

            {/* Specs Section */}
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {listing.brand && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Marca</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{listing.brand}</div>
                </div>
              )}
              {listing.model && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Modelo</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{listing.model}</div>
                </div>
              )}
              {listing.city && listing.state && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} color="#71717a" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Localização</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{listing.city} - {listing.state}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {listing.has_original_box && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 14px', borderRadius: '12px', background: 'rgba(6, 214, 160, 0.1)', border: '1px solid rgba(6, 214, 160, 0.2)', color: '#06d6a0', fontWeight: 600 }}>
                    <Package size={16} /> Caixa original
                  </span>
                )}
                {listing.has_usage_marks && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 14px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Marcas de uso
                  </span>
                )}
              </div>
            </div>

            <div className="msu-shield" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,229,255,0.05)', borderRadius: '1rem', border: '1px solid rgba(0,229,255,0.2)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <ShieldCheck size={32} color="var(--accent)" />
               <div>
                 <h4 style={{ color: 'var(--accent)', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Segurança Kings: Pague pela plataforma</h4>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Seu dinheiro fica protegido até você receber e aprovar o produto. Nunca transfira dinheiro diretamente pela negociação no WhatsApp sem usar a plataforma Oficial.</p>
               </div>
            </div>
          </div>

          {/* Direita: Price Box */}
          <div className="msu-price-box">
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ textTransform: 'uppercase', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>{listing.condition}</div>
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>{listing.title}</h1>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '2rem' }}>
                {formatPrice(listing.price)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <Button style={{ width: '100%', background: 'var(--accent)', color: '#000', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 800 }}>
                  Comprar Agora
                </Button>
                
                <NegotiateButton
                  listingId={listing.id}
                  listingTitle={listing.title}
                  listingPrice={listing.price}
                  sellerId={listing.seller_id}
                  sellerName={sellerName}
                />

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#25D366', textDecoration: 'underline' }}>Ou fale pelo WhatsApp oficial</span>
                </a>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#52525b', textAlign: 'center', lineHeight: 1.4 }}>
                  Toda negociação é intermediada pela equipe do Meu Simulador Usado.
                </p>
              </div>

              <SellerReputation sellerId={listing.seller_id} sellerName={sellerName} />

            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}
