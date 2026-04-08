import React from 'react'
import { Container, Button } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import { formatPrice } from '@kings/utils'
import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, MapPin, ShieldCheck, UserSquare2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
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

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '5rem', color: '#fff' }}>
      <Container>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/usado" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#06b6d4', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            <ArrowLeft size={16} /> Voltar para vitrine
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '3rem', alignItems: 'start' }}>
          
          {/* Esquerda: Fotos e Descrição */}
          <div>
            <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: '1rem', overflow: 'hidden', background: '#000', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>Descrição do Anúncio</h2>
            <div style={{ 
              color: '#a1a1aa', lineHeight: 1.8, whiteSpace: 'pre-wrap', 
              background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' 
            }}>
              {listing.description}
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '1rem', border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <ShieldCheck size={32} color="#06b6d4" />
               <div>
                 <h4 style={{ color: '#06b6d4', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Garantia KingsHub</h4>
                 <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>O dinheiro do comprador fica retido até que o equipamento seja entregue e testado. Negocie com paz de espírito.</p>
               </div>
            </div>
          </div>

          {/* Direita: Price Box (Sticky) */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'rgba(10, 14, 26, 0.8)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'inline-block', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '0.5px' }}>
                {listing.condition.toUpperCase()}
              </div>
              
              <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>{listing.title}</h1>
              
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#06b6d4', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                {formatPrice(listing.price)}
              </div>

              <Button style={{ width: '100%', background: '#06b6d4', color: '#000', padding: '1.5rem', fontSize: '1.2rem', fontWeight: 800, borderRadius: '0.75rem', marginBottom: '1rem' }}>
                Comprar Seguro
              </Button>
              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#71717a', marginBottom: '2rem' }}>
                Via MercadoPago | Rastreio integrado Kings
              </div>

              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }} />

              <h4 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: '1rem' }}>Sobre o vendedor</h4>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserSquare2 size={24} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{(listing as any).profiles?.full_name || 'Piloto Verificado'}</div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <CheckCircle2 size={12} /> Avaliado positivamente
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', color: '#a1a1aa', fontSize: '0.85rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> Brasil</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 600 }}>12</span> vendas</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}
