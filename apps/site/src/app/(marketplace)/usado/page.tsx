import React from 'react'
import { Container, Button } from '@kings/ui'
import { ListingCard } from '@/components/marketplace/ListingCard'

// Mock Data temporarily for Wave 1
const mockListings = [
  {
    id: 'l1',
    title: 'Volante Logitech G29 Force Feedback Semi-Novo',
    price: 1100,
    imageUrl: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=800&auto=format&fit=crop',
    condition: 'Semi-Novo',
    location: 'São Paulo, SP',
    sellerName: 'Marcos R.'
  },
  {
    id: 'l2',
    title: 'Cockpit Xtreme Racing V3 Branco + Suporte de Telas',
    price: 1850,
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    condition: 'Usado',
    location: 'Curitiba, PR',
    sellerName: 'Piloto_1990'
  },
  {
    id: 'l3',
    title: 'Fanatec CSL DD 8Nm - Apenas Base (Na Caixa)',
    price: 3600,
    imageUrl: 'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?q=80&w=800&auto=format&fit=crop',
    condition: 'Novo (Caixa Aberta)',
    location: 'Rio de Janeiro, RJ',
    sellerName: 'SimRacingRJ'
  },
  {
    id: 'l4',
    title: 'Pedal CSL Elite LC',
    price: 900,
    imageUrl: 'https://images.unsplash.com/photo-1538688423619-a81d3f23454b?q=80&w=800&auto=format&fit=crop',
    condition: 'Usado',
    location: 'Belo Horizonte, MG',
    sellerName: 'Vitor S.'
  }
]

export default function Home() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      
      {/* Hero Section */}
      <section style={{ 
        position: 'relative',
        padding: '6rem 0',
        background: 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Ambient subtle glow for MSU */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px', background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            A maior pista de desapego do <br /><span style={{ color: 'var(--accent)' }}>Automobilismo Virtual.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
            Compre e venda cockpits, volantes e acessórios diretamente com pilotos de todo o Brasil. Intermediação segura pela KingsHub.
          </p>

          <div style={{ 
            display: 'flex', maxWidth: '600px', margin: '0 auto', 
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '0.5rem',
            padding: '0.5rem', overflow: 'hidden', backdropFilter: 'blur(10px)'
          }}>
            <input 
              type="text" 
              placeholder="Ex: Volante Fanatec, Pedal Load Cell..." 
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem 1rem', outline: 'none' }}
            />
            <Button style={{ background: 'var(--accent)', color: '#000' }}>Procurar</Button>
          </div>
        </Container>
      </section>

      {/* Destaques */}
      <section style={{ padding: '5rem 0' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 700 }}>Últimos Anúncios</h2>
              <div style={{ color: 'var(--text-muted)' }}>Oportunidades quentes da comunidade</div>
            </div>
            <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Ver Todos →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {mockListings.map(listing => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>

        </Container>
      </section>

    </div>
  )
}
