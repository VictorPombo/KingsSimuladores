import { Button, Container } from '@kings/ui'
import { ArrowRight, Star, ShieldCheck, Cpu, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroCarousel } from './HeroCarousel'
import { ProductCarousel } from '@/components/store/ui/ProductCarousel'
import { createServerSupabaseClient } from '@kings/db/server'

export const dynamic = 'force-dynamic'

export default async function SevenHomePage() {
  const supabase = await createServerSupabaseClient()
  
  // Buscar a brand_id da Seven
  const { data: brand } = await supabase.from('brands').select('id').eq('name', 'seven').single()
  
  let lancamentos: any[] = []
  let maisVendidos: any[] = []
  let destaques: any[] = []
  
  if (brand) {
    // 1. Lançamentos - 6 mais recentes
    const { data: dataLanc } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)
      
    if (dataLanc) lancamentos = dataLanc
    const lancIds = lancamentos.map(p => p.id)

    // 2. Mais Vendidos - 6 por preço desc (excluindo lançamentos)
    const { data: dataMV } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('status', 'active')
      .not('id', 'in', `(${lancIds.join(',')})`)
      .order('price', { ascending: false })
      .limit(6)
      
    if (dataMV) maisVendidos = dataMV
    const mvIds = maisVendidos.map(p => p.id)

    // 3. Destaques - 6 restantes por preço asc (excluindo anteriores)
    const allExcluded = [...lancIds, ...mvIds]
    const { data: dataDest } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brand.id)
      .eq('status', 'active')
      .not('id', 'in', `(${allExcluded.join(',')})`)
      .order('price', { ascending: true })
      .limit(6)
      
    if (dataDest) destaques = dataDest
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

      <section style={{ 
        paddingTop: '60px', 
        paddingBottom: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, rgba(234, 88, 12, 0.05), transparent 70%)',
      }}>
        <style dangerouslySetInnerHTML={{__html: `
          .seven-btn-pump {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .seven-btn-pump:hover {
            transform: scale(1.08) translateY(-2px) !important;
            filter: brightness(1.2);
          }
          .seven-hero-btn-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px;
            align-items: stretch;
            justify-items: stretch;
          }
          @media (min-width: 768px) {
            .seven-hero-btn-grid { 
              gap: 16px; 
            }
          }
          .seven-hero-btn-grid a { display: block; width: 100%; }
          .seven-hero-btn-grid .seven-btn-pump {
            display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;
          }
        `}} />

        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 800, background: 'linear-gradient(to right, #ea580c, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          QUAL É SEU NÍVEL?
        </h3>

        <div className="seven-hero-btn-grid w-full max-w-[800px] px-1 md:px-0">
          <Link href="/seven/niveis/iniciante" style={{ textDecoration: 'none' }} className="w-full">
            <div style={{ padding: '8px 2px', borderRadius: '12px', border: '1px solid rgba(234, 88, 12, 0.4)', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(220, 38, 38, 0.1))', color: '#fff', fontSize: 'clamp(8px, 2.2vw, 14px)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(234, 88, 12, 0.1)', textAlign: 'center' }} className="seven-btn-pump hover:bg-[rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] whitespace-nowrap">
              INICIANTE
            </div>
          </Link>
          <Link href="/seven/niveis/semiprofissional" style={{ textDecoration: 'none' }} className="w-full">
            <div style={{ padding: '8px 2px', borderRadius: '12px', border: '1px solid rgba(234, 88, 12, 0.4)', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(220, 38, 38, 0.1))', color: '#fff', fontSize: 'clamp(8px, 2.2vw, 14px)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(234, 88, 12, 0.1)', textAlign: 'center' }} className="seven-btn-pump hover:bg-[rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] whitespace-nowrap">
              SEMIPROFISSIONAL
            </div>
          </Link>
          <Link href="/seven/niveis/profissional" style={{ textDecoration: 'none' }} className="w-full">
            <div style={{ padding: '8px 2px', borderRadius: '12px', border: '1px solid rgba(234, 88, 12, 0.4)', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(220, 38, 38, 0.1))', color: '#fff', fontSize: 'clamp(8px, 2.2vw, 14px)', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 10px rgba(234, 88, 12, 0.1)', textAlign: 'center' }} className="seven-btn-pump hover:bg-[rgba(234,88,12,0.3)] hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] whitespace-nowrap">
              PROFISSIONAL
            </div>
          </Link>
        </div>
      </section>

      {/* Vitrines de Produtos Seven */}
      {(lancamentos.length > 0 || maisVendidos.length > 0 || destaques.length > 0) && (
        <section style={{ paddingTop: '80px', paddingBottom: '80px', overflow: 'hidden' }}>
          <Container>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 10, padding: '0 24px' }}>
              <Link href="/seven/produtos" className="font-display hover:underline" style={{ color: '#f97316', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '1px', fontSize: 'clamp(12px, 3vw, 16px)' }}>
                VER CATÁLOGO COMPLETO <ArrowRight size={16} />
              </Link>
            </div>

            {lancamentos.length > 0 && (
              <ProductCarousel title="LANÇAMENTOS" prods={lancamentos} tenant="seven" />
            )}
            {maisVendidos.length > 0 && (
              <ProductCarousel title="MAIS VENDIDOS" prods={maisVendidos} tenant="seven" />
            )}
            {destaques.length > 0 && (
              <ProductCarousel title="DESTAQUES" prods={destaques} tenant="seven" />
            )}
          </Container>
        </section>
      )}
    </>
  )
}
