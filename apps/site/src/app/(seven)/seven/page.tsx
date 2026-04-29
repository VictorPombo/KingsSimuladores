import { Button, Container } from '@kings/ui'
import { ArrowRight, Star, ShieldCheck, Cpu, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroCarousel } from './HeroCarousel'
import { ProductCarousel } from '@/components/store/ui/ProductCarousel'
import { createServerSupabaseClient } from '@kings/db/server'

export default async function SevenHomePage() {
  const supabase = await createServerSupabaseClient()
  
  // Buscar a brand_id da Seven
  const { data: brand } = await supabase.from('brands').select('id').eq('slug', 'seven').single()
  
  let products: any[] = []
  
  if (brand) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8)
      
    if (data) products = data
  }
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
            <Link href="/seven/produtos" className="font-display hover:underline" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '1px' }}>
              VER CATÁLOGO COMPLETO <ArrowRight size={16} />
            </Link>
          </div>

          {products.length > 0 ? (
            <ProductCarousel 
              title="Lançamentos Simagic" 
              prods={products} 
              tenant="seven" 
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <p>Os produtos da nova coleção estão sendo preparados...</p>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
