import { Container } from '@kings/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso | Kings Simuladores',
  description: 'Termos e condições gerais de uso do site Kings Simuladores. Leia antes de realizar sua compra.',
}

export default function TermosPage() {
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
              Termos de Uso
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>1. Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar o site Kings Simuladores (kingssimuladores.com.br), você concorda com estes Termos de Uso. Caso não concorde, recomendamos que não utilize nossos serviços.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>2. Sobre a Kings Simuladores</h2>
              <p>A Kings Simuladores é uma loja online especializada em simuladores de corrida, comercializando cockpits, volantes, pedais, bases e acessórios das melhores marcas do mercado. CNPJ: 29.688.089/0001-02.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>3. Cadastro</h2>
              <p>Para realizar compras, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável pela segurança da sua senha e por todas as atividades realizadas com sua conta.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>4. Preços e Pagamento</h2>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Os preços são apresentados em Reais (R$) e podem ser alterados sem aviso prévio</li>
                <li>O preço válido é o exibido no momento da finalização do pedido</li>
                <li>Aceitamos Pix, cartão de crédito (até 12x sem juros) e boleto bancário via Mercado Pago</li>
                <li>Pedidos pagos via Pix possuem desconto de 10% sobre o valor do produto</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>5. Entrega</h2>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Realizamos entregas para todo o Brasil</li>
                <li>O prazo de entrega é calculado a partir da confirmação do pagamento</li>
                <li>Os prazos estimados são informados no checkout e podem variar conforme a região</li>
                <li>A Kings Simuladores não se responsabiliza por atrasos causados pelas transportadoras</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>6. Garantia</h2>
              <p>Todos os produtos possuem garantia conforme as regras do fabricante e do Código de Defesa do Consumidor. Consulte a página de cada produto para informações específicas sobre a garantia.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>7. Propriedade Intelectual</h2>
              <p>Todo o conteúdo do site — incluindo textos, imagens, logotipos e layout — é de propriedade da Kings Simuladores ou licenciado por terceiros. É proibida a reprodução sem autorização prévia.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>8. Limitação de Responsabilidade</h2>
              <p>A Kings Simuladores não se responsabiliza por danos indiretos decorrentes do uso dos produtos fora das especificações do fabricante, incluindo instalação incorreta ou uso inadequado.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>9. Alterações nos Termos</h2>
              <p>Estes termos podem ser atualizados a qualquer momento. A versão vigente será sempre a publicada nesta página.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Última atualização: Maio de 2026</p>
            </section>

            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Dúvidas sobre os Termos?</h2>
              <p style={{ margin: 0 }}>
                Entre em contato pelo e-mail{' '}
                <a href="mailto:contato@kingssimuladores.com.br" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>contato@kingssimuladores.com.br</a>
                {' '}ou pelo WhatsApp{' '}
                <a href="https://wa.me/5511959018725" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>(11) 95901-8725</a>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}
