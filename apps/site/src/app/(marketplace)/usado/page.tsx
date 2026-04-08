import React from 'react'
import { Container, Button } from '@kings/ui'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '80px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .hero-title { font-size: 3.5rem; }
        .hero-desc { font-size: 1.2rem; }
        .msu-form { flex-direction: row; }
        .msu-header { flex-direction: row; justify-content: space-between; align-items: end; }
        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem !important; }
          .hero-desc { font-size: 1rem !important; padding: 0 1rem; }
          .msu-form { flex-direction: column !important; }
          .msu-form input { border-bottom: 1px solid rgba(255,255,255,0.1) !important; margin-bottom: 8px; }
          .msu-form button { width: 100%; border-radius: 4px; }
          .msu-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px; }
        }
      `}} />

      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        padding: '6rem 0',
        background: 'transparent',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Ambient subtle glow for MSU */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '800px', height: '400px', background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 className="hero-title" style={{ fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            A maior pista de desapego do <br /><span style={{ color: 'var(--accent)' }}>Automobilismo Virtual.</span>
          </h1>
          <p className="hero-desc" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            Compre e venda cockpits, volantes e acessórios diretamente com pilotos de todo o Brasil. Intermediação segura pela KingsHub.
          </p>

          <form action="/usado/produtos" className="msu-form" style={{ 
            display: 'flex', maxWidth: '600px', margin: '0 auto', 
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '0.5rem',
            padding: '0.5rem', overflow: 'hidden', backdropFilter: 'blur(10px)'
          }}>
            <input 
              type="text"
              name="q" 
              placeholder="Ex: Volante Fanatec, Pedal Load Cell..." 
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem 1rem', outline: 'none' }}
            />
            <Button type="submit" style={{ background: 'var(--accent)', color: '#000' }}>Procurar</Button>
          </form>
        </Container>
      </section>

      {/* Destaques */}
      <section style={{ padding: '5rem 0' }}>
        <Container>
          <div className="msu-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700 }}>Últimos Anúncios</h2>
              <div style={{ color: 'var(--text-muted)' }}>Oportunidades quentes da comunidade</div>
            </div>
            <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Ver Todos →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {listings?.map(listing => (
              <ListingCard 
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                condition={listing.condition}
                imageUrl={listing.images[0]}
                location="Brasil"
                sellerName={(listing as any).profiles?.full_name || 'Piloto Oculto'}
              />
            ))}
            
            {listings?.length === 0 && (
              <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0' }}>
                Nenhum anúncio disponível no momento. Seja o primeiro a anunciar!
              </div>
            )}
          </div>

        </Container>
      </section>

    </div>
  )
}
