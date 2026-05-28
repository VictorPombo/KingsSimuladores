import { Container } from '@kings/ui'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Kings Simuladores',
  description: 'Entenda como a Kings Simuladores coleta, armazena e utiliza seus dados pessoais, em conformidade com a LGPD.',
}

export default function PoliticaDePrivacidadePage() {
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
              Política de Privacidade
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>1. Informações que Coletamos</h2>
              <p>A Kings Simuladores coleta informações necessárias para processar suas compras e oferecer a melhor experiência possível:</p>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Dados cadastrais:</strong> nome, e-mail, CPF/CNPJ, telefone e endereço</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Dados de navegação:</strong> páginas visitadas, tempo de permanência e dispositivo utilizado</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Dados de pagamento:</strong> processados de forma segura pelo Mercado Pago, sem armazenamento em nossos servidores</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>2. Como Usamos seus Dados</h2>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Processar e entregar seus pedidos</li>
                <li>Enviar atualizações sobre o status do pedido</li>
                <li>Melhorar a experiência de navegação no site</li>
                <li>Enviar comunicações promocionais (somente com seu consentimento)</li>
                <li>Cumprir obrigações legais e fiscais</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>3. Compartilhamento de Dados</h2>
              <p>Seus dados pessoais <strong style={{ color: 'var(--text-primary)' }}>não são vendidos</strong> para terceiros. Compartilhamos informações apenas com:</p>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Transportadoras:</strong> para realizar a entrega dos pedidos</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Processadores de pagamento:</strong> Mercado Pago, para processar transações</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Autoridades legais:</strong> quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>4. Segurança</h2>
              <p>Utilizamos criptografia SSL/TLS em todo o site, garantindo que suas informações trafeguem de forma segura. Nossos servidores são protegidos por firewalls e monitoramento contínuo.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>5. Seus Direitos (LGPD)</h2>
              <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
              <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Acessar seus dados pessoais armazenados</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão dos seus dados</li>
                <li>Revogar o consentimento para comunicações promocionais</li>
                <li>Solicitar a portabilidade dos seus dados</li>
              </ul>
              <p>Para exercer qualquer um desses direitos, entre em contato pelo e-mail <a href="mailto:contato@kingssimuladores.com.br" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>contato@kingssimuladores.com.br</a>.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>6. Cookies</h2>
              <p>Utilizamos cookies para melhorar sua experiência de navegação, lembrar preferências e analisar o tráfego do site. Você pode desativar os cookies nas configurações do seu navegador, mas isso pode afetar algumas funcionalidades.</p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>7. Atualizações desta Política</h2>
              <p>Esta política pode ser atualizada periodicamente. Recomendamos que você a revise regularmente. A data da última atualização está indicada abaixo.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Última atualização: Maio de 2026</p>
            </section>

            <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Dúvidas sobre Privacidade?</h2>
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
