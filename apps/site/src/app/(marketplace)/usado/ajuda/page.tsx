import React from 'react'
import { Container } from '@kings/ui'
import Link from 'next/link'

export const metadata = {
  title: 'Ajuda | Meu Simulador Usado',
  description: 'Como vender, dicas de segurança e regras do marketplace Meu Simulador Usado.',
}

export default function AjudaPage() {
  const sectionStyle: React.CSSProperties = {
    marginBottom: '48px', padding: '32px',
    background: 'rgba(15,18,30,0.5)', borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
  }
  const h2Style: React.CSSProperties = {
    fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px',
    display: 'flex', alignItems: 'center', gap: '10px',
  }
  const liStyle: React.CSSProperties = {
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.7,
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <Container>
        <Link href="/usado" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#71717a', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px' }}>
          ← Voltar
        </Link>

        <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, margin: '0 0 8px' }}>Central de Ajuda</h1>
        <p style={{ color: '#71717a', fontSize: '0.95rem', marginBottom: '40px' }}>Tire suas dúvidas sobre como funciona o Meu Simulador Usado.</p>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" style={sectionStyle}>
          <h2 style={h2Style}>🔄 Como Funciona</h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }}>
            Nossa plataforma é intermediadora de confiança para garantir segurança para vendedor e comprador.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', background: 'rgba(0,229,255,0.04)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.1)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00e5ff', marginBottom: '10px' }}>Para o Vendedor</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={liStyle}>• Anuncie pelo valor desejado</li>
                <li style={liStyle}>• Taxa administrativa de 15% sobre o valor final</li>
                <li style={liStyle}>• Exemplo: Anuncia R$5.000 → Recebe R$4.250</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: 'rgba(6,214,160,0.04)', borderRadius: '12px', border: '1px solid rgba(6,214,160,0.1)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#06d6a0', marginBottom: '10px' }}>Compra e Segurança (Escrow)</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={liStyle}>• Comprador paga direto para a plataforma</li>
                <li style={liStyle}>• Dinheiro fica retido até confirmação do item</li>
                <li style={liStyle}>• Grupo no WhatsApp com vendedor, comprador e suporte</li>
              </ul>
            </div>
            <div style={{ padding: '20px', background: 'rgba(245,158,11,0.04)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '10px' }}>Regra das 24 Horas</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={liStyle}>• <strong style={{ color: '#f59e0b' }}>OBRIGATÓRIO:</strong> Gravar vídeo contínuo do unboxing</li>
                <li style={liStyle}>• Sem cortes, sem interrupções</li>
                <li style={liStyle}>• O comprador tem 24h para reportar problemas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* COMO VENDER */}
        <section id="como-vender" style={sectionStyle}>
          <h2 style={h2Style}>📦 Como Vender</h2>
          <ol style={{ padding: '0 0 0 20px', margin: 0 }}>
            {[
              'Crie sua conta e complete seu perfil',
              'Clique em "Anunciar Produto"',
              'Leia e aceite as regras da plataforma',
              'Preencha: Marca, Modelo, Preço, Cidade, Fotos (até 5)',
              'Informe o CEP e dimensões para cálculo de frete',
              'Publique e aguarde contato de compradores',
              'Ao vender, acompanhe o processo pelo grupo WhatsApp da plataforma',
              'Receba o pagamento após confirmação do comprador (máximo 24h após entrega)',
            ].map((step, i) => (
              <li key={i} style={{ ...liStyle, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#00e5ff', fontWeight: 800, minWidth: '24px' }}>{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* DICAS DE SEGURANÇA */}
        <section id="seguranca" style={{ ...sectionStyle, borderColor: 'rgba(239,68,68,0.15)' }}>
          <h2 style={h2Style}>🛡️ Dicas de Segurança</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              { text: 'NUNCA combine pagamento fora da plataforma', icon: '🚫' },
              { text: 'NUNCA passe seus dados bancários a compradores', icon: '🔒' },
              { text: 'SEMPRE exija o vídeo de unboxing ao comprar', icon: '📹' },
              { text: 'SEMPRE use o escrow da plataforma', icon: '✅' },
              { text: 'Se receber proposta suspeita, reporte ao admin', icon: '⚠️' },
              { text: 'Toda negociação deve passar pela plataforma', icon: '💬' },
              { text: 'Em caso de problema, contate o suporte pelo WhatsApp oficial', icon: '📞' },
            ].map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', background: 'rgba(239,68,68,0.03)',
                borderRadius: '10px', border: '1px solid rgba(239,68,68,0.08)',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{tip.icon}</span>
                <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* REGRAS DE MODERAÇÃO */}
        <section id="regras" style={sectionStyle}>
          <h2 style={h2Style}>⚖️ Regras de Moderação</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Proibido anunciar produtos roubados ou furtados',
              'Proibido combinar pagamento fora da plataforma',
              'Proibido criar múltiplos anúncios do mesmo produto',
              'Proibido fotos enganosas ou de outros anúncios',
              'Descumprir as regras pode resultar em banimento permanente',
              'A plataforma pode cancelar transações suspeitas a qualquer momento',
              'Taxa de 15% é aplicada sobre TODAS as vendas — sem exceção',
              'O vídeo de unboxing é OBRIGATÓRIO — sem exceção',
            ].map((rule, i) => (
              <li key={i} style={{ ...liStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#ef4444', fontWeight: 800 }}>•</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

      </Container>
    </div>
  )
}
