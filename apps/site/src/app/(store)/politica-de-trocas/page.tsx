import { Container } from '@kings/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Trocas e Devoluções | Kings Simuladores',
  description: 'Saiba como funcionam trocas, devoluções e reembolsos na Kings Simuladores. Garantimos seu direito de arrependimento conforme o CDC.',
}

export default function PoliticaDeTrocasPage() {
  return (
    <div style={{ padding: 'clamp(32px, 5vw, 60px) 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px' }} />
              <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Institucional</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Política de Trocas e Devoluções
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>1. Direito de Arrependimento</h2>
              <p>De acordo com o art. 49 do Código de Defesa do Consumidor (CDC), você tem o direito de desistir da compra em até <strong style={{ color: 'var(--text-primary)' }}>7 dias corridos</strong> após o recebimento do produto, sem necessidade de justificativa.</p>
              <p>Para exercer esse direito, entre em contato pelo nosso WhatsApp <strong style={{ color: 'var(--text-primary)' }}>(11) 95901-8725</strong> ou pelo e-mail <strong style={{ color: 'var(--text-primary)' }}>contato@kingssimuladores.com.br</strong>.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>2. Condições para Troca ou Devolução</h2>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>O produto deve estar na embalagem original, sem sinais de uso</li>
                <li>Todos os acessórios, manuais e brindes devem ser devolvidos junto</li>
                <li>É necessário apresentar a nota fiscal de compra</li>
                <li>Produtos com defeito de fabricação podem ser trocados em até 90 dias</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>3. Produtos com Defeito</h2>
              <p>Se o produto apresentar defeito de fabricação, a Kings Simuladores realizará a troca ou reparo conforme previsto no CDC. O prazo para solicitação é de:</p>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>30 dias</strong> para produtos não duráveis</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>90 dias</strong> para produtos duráveis (simuladores, periféricos, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>4. Como Solicitar</h2>
              <ol style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Entre em contato pelo WhatsApp ou e-mail informando o número do pedido</li>
                <li>Nossa equipe analisará a solicitação em até 2 dias úteis</li>
                <li>Após aprovação, enviaremos as instruções de postagem (sem custo para você em caso de defeito)</li>
                <li>O reembolso será processado em até 10 dias úteis após o recebimento do produto</li>
              </ol>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>5. Reembolso</h2>
              <p>O reembolso será realizado pela mesma forma de pagamento utilizada na compra:</p>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Cartão de crédito:</strong> estorno em até 2 faturas</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Pix/Boleto:</strong> transferência em até 10 dias úteis</li>
              </ul>
            </section>

            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Dúvidas?</h2>
              <p style={{ margin: 0 }}>
                Fale com a gente pelo WhatsApp{' '}
                <a href="https://wa.me/5511959018725" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>(11) 95901-8725</a>
                {' '}ou pelo e-mail{' '}
                <a href="mailto:contato@kingssimuladores.com.br" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>contato@kingssimuladores.com.br</a>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}
