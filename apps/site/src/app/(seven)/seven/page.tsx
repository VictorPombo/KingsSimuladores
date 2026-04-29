import { Button, Container } from '@kings/ui'
import { ArrowRight, Star, ShieldCheck, Cpu, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { HeroCarousel } from './HeroCarousel'
import { ProductCarousel } from '@/components/store/ui/ProductCarousel'

export default function SevenHomePage() {
  return (
    <>
      {/* Hero Section Banner Animado */}
      <HeroCarousel />

      {/* Faixa Informativa (Marquee) */}
      <div style={{ background: '#05070a', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', animation: 'marquee 25s linear infinite' }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}} />
          {/* O conteúdo é duplicado para criar o efeito infinito contínuo */}
          {[1, 2].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '60px', paddingRight: '60px', flexShrink: 0, alignItems: 'center' }}>
              <span className="font-display" style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, letterSpacing: '1px' }}>
                <span style={{ color: '#ea580c' }}>NACIONAL</span> - ENVIAMOS PARA TODO O BRASIL
              </span>
              <span className="font-display" style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, letterSpacing: '1px' }}>
                <span style={{ color: '#ea580c' }}>PARCELE SUAS COMPRAS</span> - EM ATÉ 10X SEM JUROS!!!
              </span>
              <span className="font-display" style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700, letterSpacing: '1px' }}>
                <span style={{ color: '#ea580c' }}>10% DE DESCONTO</span> - PAGAMENTO POR PIX
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section style={{ paddingTop: '100px', paddingBottom: '100px', overflow: 'hidden' }}>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px', position: 'relative', zIndex: 10, padding: '0 24px' }}>
            <a href="#" className="font-display hover:underline" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '1px' }}>
              VER CATÁLOGO COMPLETO <ArrowRight size={16} />
            </a>
          </div>

          <ProductCarousel 
            title="Lançamentos Simagic" 
            prods={[
              { id: 'simagic-alpha-mini', title: 'Base Simagic Alpha Mini (10Nm)', price: 5990.00, price_compare: 6490.00, images: ['https://placehold.co/400x400/141416/f97316?text=Simagic+Alpha'], attributes: { brand: 'Simagic' }, slug: 'base-simagic-alpha-mini' },
              { id: 'simagic-gt-neo', title: 'Volante Simagic GT Neo', price: 3890.00, images: ['https://placehold.co/400x400/141416/f97316?text=GT+Neo'], attributes: { brand: 'Simagic' }, slug: 'volante-simagic-gt-neo' },
              { id: 'simagic-p1000', title: 'Pedais P1000 Invertidos', price: 4790.00, images: ['https://placehold.co/400x400/141416/f97316?text=P1000'], attributes: { brand: 'Simagic' }, slug: 'pedais-p1000' },
              { id: 'simagic-fx-pro', title: 'Volante Simagic FX Pro', price: 6590.00, images: ['https://placehold.co/400x400/141416/f97316?text=FX+Pro'], attributes: { brand: 'Simagic' }, slug: 'volante-fx-pro' },
              { id: 'simagic-alpha-u', title: 'Base Simagic Alpha Ultimate (23Nm)', price: 9990.00, images: ['https://placehold.co/400x400/141416/f97316?text=Alpha+U'], attributes: { brand: 'Simagic' }, slug: 'base-alpha-u' }
            ]} 
            tenant="seven" 
          />
        </Container>
      </section>
    </>
  )
}
