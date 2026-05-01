import { Container } from '@kings/ui'
import Link from 'next/link'

export default function ConsultoriaPage() {

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        {/* Banner Hero estilo NÍVEIS */}
        <div style={{ 
          marginBottom: '48px', 
          background: 'rgba(10, 12, 18, 0.4)', 
          padding: 'clamp(24px, 5vw, 60px)', 
          borderRadius: '16px', 
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            background: `radial-gradient(circle at 10% 90%, rgba(0, 229, 255, 0.25) 0%, transparent 70%)`,
            zIndex: 0,
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px', boxShadow: `0 0 10px var(--accent)` }} />
                <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', color: 'var(--accent)', margin: 0, fontWeight: 700 }}>SERVIÇO ESPECIALIZADO</h4>
              </div>
              <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)', textShadow: `0 0 30px rgba(0, 229, 255, 0.4)`, lineHeight: 1.1 }}>
                <span style={{ display: 'block' }}>CONSULTORIA</span>
                <span style={{ display: 'block', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                  MONTAGEM E AJUSTES
                </span>
              </h1>
              <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: 'clamp(1rem, 2vw, 1.15rem)' }}>
                  A Kings oferece consultoria especializada para montagem e ajustes finos. Configuração de botões, ajustes de telas para o FOV ideal, telemetria baseada no seu rig e imersão sem dores nas costas para stint completo.
                </p>
                <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                  <div style={{ fontSize: '2rem' }}>🎟️</div>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--success)' }}>100% REVERTIDO EM CUPOM!</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      O valor da consultoria (R$ 300) é inteiramente revertido em desconto imediato na sua próxima compra de hardware no site.
                    </p>
                  </div>
                </div>
               </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>SERVIÇOS DISPONÍVEIS</h2>
          </div>

          {/* Cards de Consultoria */}
          <style dangerouslySetInnerHTML={{__html: `
            .consult-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            @media (max-width: 640px) { .consult-grid { grid-template-columns: 1fr; } }
          `}} />

          <div className="consult-grid">
            {/* Card Principal */}
            <div style={{
              gridColumn: '1 / -1', padding: '32px', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(16,185,129,0.04))',
              border: '1px solid rgba(0,229,255,0.2)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,229,255,0.1)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px', width: 'fit-content' }}>
                ⭐ Mais Contratado
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>Consultoria de Instalação e Ajuste Fino</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {['Todo suporte em compras de equipamentos, melhores lojas etc.', 'Ajuste de FOV ideal para sua tela', 'Telemetria baseada no seu equipamento', 'Postura e ergonomia para stint longo'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#a1a1aa' }}>
                    <span style={{ color: '#06d6a0' }}>✦</span> {item}
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(6,214,160,0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(6,214,160,0.2)', display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🎟️</span>
                <div>
                  <strong style={{ color: '#06d6a0', fontSize: '1rem' }}>100% REVERTIDO EM CUPOM!</strong>
                  <p style={{ margin: '4px 0 0', color: '#71717a', fontSize: '0.85rem' }}>O valor é integralmente convertido em desconto na sua próxima compra de hardware.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#00e5ff' }}>R$ 300,00</div>
                <Link href="/produtos?q=consultoria" style={{ textDecoration: 'none', background: '#00e5ff', color: '#000', padding: '12px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem' }}>
                  CONTRATAR →
                </Link>
              </div>
            </div>

            {/* Card Online */}
            <div style={{ padding: '28px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '1.5rem' }}>💻</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Consultoria Online</h3>
              <p style={{ color: '#71717a', fontSize: '0.85rem', margin: 0 }}>Via Discord ou Google Meet — ao vivo com nosso especialista.</p>
              <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 2 }}>
                <li>Montagem assistida em tempo real</li>
                <li>Configuração completa de software</li>
                <li>Suporte durante toda a sessão</li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa' }}>R$ 1.230,00</div>
                <Link href="/produtos?q=consultoria+online" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '12px', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(167,139,250,0.3)' }}>
                  Contratar Online
                </Link>
              </div>
            </div>

            {/* Card Presencial */}
            <div style={{ padding: '28px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '1.5rem' }}>🏠</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Consultoria Presencial</h3>
              <p style={{ color: '#71717a', fontSize: '0.85rem', margin: 0 }}>Nossa equipe vai até você — em qualquer lugar do Brasil.</p>
              <ul style={{ margin: 0, padding: '0 0 0 16px', color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 2 }}>
                <li>Instalação completa no local</li>
                <li>Ajuste fino presencial</li>
                <li>+ custos de viagem e hospedagem</li>
              </ul>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>R$ 2.000,00<span style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500 }}> / dia</span></div>
                <a href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20contratar%20a%20Consultoria%20Presencial" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '12px', background: 'rgba(37,211,102,0.12)', color: '#25D366', padding: '12px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(37,211,102,0.3)' }}>
                  Solicitar via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
