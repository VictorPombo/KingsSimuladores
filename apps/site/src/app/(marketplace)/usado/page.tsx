import React from 'react'
import { Container, Button } from '@kings/ui'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { createServerSupabaseClient } from '@kings/db/server'
import { Search, ShieldCheck, Tag, Zap } from 'lucide-react'
import Link from 'next/link'

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
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px', color: '#fff', overflowX: 'hidden' }}>
      
      {/* Hero Section / Cyberpunk Glow */}
      <section style={{ 
        position: 'relative',
        padding: '6rem 0 8rem 0',
        background: 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden'
      }}>
        {/* Ambient subtle cyan glow */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '600px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: '-40%', right: '-20%',
          width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <Container style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <Zap size={14} /> NOVO LAYOUT, MESMA PAIXÃO
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
              O Ponto de Encontro do <br />
              <span style={{ color: 'transparent', WebkitTextStroke: '1px #06b6d4', backgroundImage: 'linear-gradient(90deg, #fff, #06b6d4)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>Sim Racing Nacional.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#a1a1aa', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
              Compre, venda e troque volantes, pedais, cockpits e equipamentos diretamente com pilotos reais. Mais seguro, rápido e 100% focado em Automobilismo Virtual.
            </p>

            {/* Smart Search Form */}
            <form action="/usado/produtos" style={{ 
              display: 'flex', width: '100%', 
              background: 'rgba(10, 14, 26, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem',
              padding: '0.75rem', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              transition: 'border 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: '#a1a1aa' }}>
                <Search size={22} />
              </div>
              <input 
                type="text"
                name="q" 
                placeholder="Busque por 'Moza R9', 'Logitech G29', 'Cockpit XT'..." 
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem 0', outline: 'none', fontSize: '1.1rem' }}
              />
              <Button type="submit" style={{ background: '#06b6d4', color: '#000', fontWeight: 800, padding: '0 2rem', borderRadius: '0.5rem' }}>Procurar Anúncio</Button>
            </form>
          </div>
        </Container>
      </section>

      {/* Bubble Categories */}
      <section style={{ padding: '3rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            {[
              { id: 'volantes', name: 'Volantes e Bases', emoji: '🏎️' },
              { id: 'pedais', name: 'Pedais', emoji: '🦶' },
              { id: 'cockpits', name: 'Cockpits', emoji: '🏁' },
              { id: 'cambios', name: 'Câmbios e Freios', emoji: '🕹️' },
              { id: 'acessorios', name: 'Acessórios VR/Telas', emoji: '🥽' }
            ].map(cat => (
              <a href={`/usado/produtos?categoria=${cat.id}`} key={cat.id} style={{ 
                textDecoration: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.8rem 1.5rem', borderRadius: '2rem', color: '#e4e4e7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#06b6d4'
                e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{cat.emoji}</span> {cat.name}
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Oportunidades Section */}
      <section style={{ padding: '6rem 0' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#06b6d4', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                <Tag size={16} /> NEGÓCIOS RECENTES
              </div>
              <h2 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>Oportunidades Quentes 🔥</h2>
            </div>
            <Link href="/usado/produtos" style={{ color: '#06b6d4', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 1rem', background: 'rgba(6,182,212,0.1)', borderRadius: '0.5rem', transition: 'background 0.2s' }}>
              Explorar Garagem Completa →
            </Link>
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
                location="Brasil Central"
                sellerName={(listing as any).profiles?.full_name || 'Piloto Verificado'}
              />
            ))}
            
            {listings?.length === 0 && (
              <div style={{ color: '#71717a', gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 0', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                Nenhum anúncio disponível no momento.<br/>Seja o piloto pioneiro a anunciar no novo layout!
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Call to Action: Venda seu equipamento */}
      <section style={{ padding: '5rem 0', background: 'rgba(6, 182, 212, 0.05)', borderTop: '1px solid rgba(6, 182, 212, 0.1)', borderBottom: '1px solid rgba(6, 182, 212, 0.1)' }}>
         <Container>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-1px', lineHeight: 1.1 }}>
                  Upgrades chegam, espaços se apertam.
                </h2>
                <p style={{ color: '#a1a1aa', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Fez um upgrade na base ou no pedal? Transforme seu equipamento encostado em caixa com segurança. Nossa plataforma foi desenhada para conectar você aos pilotos de todo o Brasil.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button asChild style={{ background: '#06b6d4', color: '#000', fontWeight: 800, padding: '1.5rem 2rem', fontSize: '1.1rem' }}>
                    <Link href="/usado/vender">Anunciar Gratuitamente</Link>
                  </Button>
                  <Button variant="outline" asChild style={{ padding: '1.5rem 2rem', fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    <Link href="/usado/como-funciona">Saber Mais</Link>
                  </Button>
                </div>
              </div>
              <div style={{ background: 'rgba(10, 14, 26, 0.6)', padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><ShieldCheck size={28} /></div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>Pagamento Protegido</h4>
                      <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Receba pelo MercadoPago com taxa congelada e garantida.</div>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}><Zap size={28} /></div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>Audiência Focada</h4>
                      <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Venda para pessoas que realmente entendem o valor do seu setup.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
         </Container>
      </section>

    </div>
  )
}
