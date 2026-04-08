import React from 'react'
import { Container, Button } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import { formatPrice } from '@kings/utils'
import { notFound } from 'next/navigation'
import { MessageCircle, ShieldCheck } from 'lucide-react'

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
  
  // Mensagem pré-formatada para Zap do vendedor (MVP Negociação)
  const itemName = encodeURIComponent(listing.title)
  const itemPrice = encodeURIComponent(formatPrice(listing.price))
  const zapMessage = `Olá ${sellerName}, vi seu anúncio no MSU (Meu Simulador Usado):\n\n*${itemName}* por ${itemPrice}\n\nAinda está disponível? Aceita proposta?`
  const whatsappUrl = `https://wa.me/?text=${zapMessage}` // Adicionaremos o fone real se houver dps. Para o MVP redireciona p/ WhatsApp intent.

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .msu-detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 3rem; align-items: start; }
        .msu-price-box { position: sticky; top: 100px; }
        .msu-shield { flex-direction: row; }
        @media (max-width: 992px) {
          .msu-detail-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .msu-price-box { position: relative !important; top: 0 !important; }
          .msu-shield { flex-direction: column !important; text-align: center; }
        }
      `}} />
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
                
                <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 600, border: '1px solid #25D366', color: '#25D366' }}>
                    <MessageCircle size={20} /> Fazer Oferta
                  </Button>
                </a>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vendedor</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{sellerName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Membro confiável (C2C)</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}
